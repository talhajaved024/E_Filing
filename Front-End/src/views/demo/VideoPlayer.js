import React, { Component, createRef } from "react";
import axios from "axios";
import videojs from "video.js";
import "video.js/dist/video-js.css";
//import { VideoPlayer } from "cloudinary-video-player";

class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      uploadedFileName: null,
      videoList: [],
      selectedVideo: null,
      videoKey: 0, // key to force video tag remount
      showPlayer: true,
    };
    this.videoNode = createRef();
    this.player = null;
  }

  componentDidMount() {
    this.fetchVideoList();
  }

  componentDidUpdate(prevProps, prevState) {
    const { selectedVideo, videoKey } = this.state;

    if (
      selectedVideo !== prevState.selectedVideo ||
      videoKey !== prevState.videoKey
    ) {
      if (this.player) {
        this.player.dispose();
        this.player = null;
      }

      // Delay to ensure DOM is ready before re-initializing
      setTimeout(() => {
        this.initializePlayer(selectedVideo);
      }, 0);
    }
  }

  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }

  fetchVideoList = () => {
    axios
      .get("http://localhost:8080/api/videos/list")
      .then((res) => {
        this.setState({ videoList: res.data });
      })
      .catch((err) => {
        console.error("Failed to load video list:", err);
      });
  };

  onFileChange = (event) => {
    this.setState({ selectedFile: event.target.files[0] });
  };

  onUpload = () => {
    const { selectedFile } = this.state;

    if (!selectedFile) {
      alert("Please select a video file first.");
      return;
    }

    const data = new FormData();
    data.append("file", selectedFile);

    axios
      .post("http://localhost:8080/api/videos/upload", data)
      .then(() => {
        const fileName = selectedFile.name;
        this.setState((prevState) => ({
          uploadedFileName: fileName,
          selectedVideo: fileName,
          videoKey: prevState.videoKey + 1,
        }));
        this.fetchVideoList();
        alert("Upload successful!");
      })
      .catch((err) => {
        console.error("Upload error:", err);
        alert("Upload failed.");
      });
  };

  handleVideoSelect = (videoName) => {
  this.setState({ showPlayer: false }, () => {
    setTimeout(() => {
      this.setState((prevState) => ({
        selectedVideo: videoName,
        videoKey: prevState.videoKey + 1,
        showPlayer: true,
      }));
    }, 0); // wait for DOM to fully unmount
  });
};


  initializePlayer = (videoName) => {
    if (!this.videoNode.current || !videoName) return;

    const videoUrl = `http://localhost:8080/api/videos/stream/${videoName}`;

    this.player = videojs(this.videoNode.current, {
      controls: true,
      autoplay: false,
      preload: "auto",
      width: 800,
      height: 400,
      sources: [
        {
          src: videoUrl,
          type: "video/mp4",
        },
      ],
    });
  };

  render() {
    const { videoList, selectedVideo, videoKey } = this.state;

    return (
      <div style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
        <h2 style={{ marginBottom: "20px", color: "#333" }}>
          🎞️ Video Upload & Explorer (Video.js Player)
        </h2>

        {/* Upload Section */}
        <div style={styles.uploadSection}>
          <input
            type="file"
            accept="video/*"
            onChange={this.onFileChange}
            style={styles.fileInput}
          />
          <button onClick={this.onUpload} style={styles.uploadButton}>
            ⬆ Upload
          </button>
        </div>

        <div style={styles.container}>
          {/* Video List */}
          <div style={styles.videoListContainer}>
            <h4 style={styles.sectionTitle}>📁 Available Videos</h4>
            <ul style={styles.videoList}>
              {videoList.map((video, index) => (
                <li
                  key={index}
                  onClick={() => this.handleVideoSelect(video)}
                  style={{
                    ...styles.videoListItem,
                    backgroundColor:
                      video === selectedVideo ? "#007bff" : "#fff",
                    color: video === selectedVideo ? "#fff" : "#333",
                  }}
                >
                  {video}
                </li>
              ))}
            </ul>
          </div>

          {/* Video Player */}
          <div style={styles.videoPlayerContainer}>
            {selectedVideo && this.state.showPlayer ? (
                <>
                    <h4 style={styles.sectionTitle}>
                    ▶ Now Playing: {selectedVideo}
                    </h4>
                    <div data-vjs-player>
                    <video
                        key={videoKey}
                        ref={this.videoNode}
                        className="video-js vjs-default-skin"
                    />
                    </div>
                </>
                ) : (
                <p style={{ color: "#777" }}>
                    Select a video from the list to play.
                </p>
                )}
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  uploadSection: {
    display: "flex",
    alignItems: "center",
    marginBottom: "30px",
    gap: "10px",
  },
  fileInput: {
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    width: "250px",
  },
  uploadButton: {
    padding: "8px 16px",
    backgroundColor: "#28a745",
    border: "none",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  container: {
    display: "flex",
    gap: "40px",
  },
  videoListContainer: {
    width: "30%",
  },
  videoList: {
    listStyle: "none",
    padding: 0,
    marginTop: "10px",
  },
  videoListItem: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    marginBottom: "10px",
    cursor: "pointer",
    transition: "background-color 0.2s, color 0.2s",
  },
  sectionTitle: {
    marginBottom: "10px",
    color: "#444",
  },
  videoPlayerContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 0 10px rgba(0,0,0,0.05)",
  },
};

export default VideoPlayer;
