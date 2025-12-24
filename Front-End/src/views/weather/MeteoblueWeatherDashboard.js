import React, { useState, useEffect } from 'react';
import { 
  CCard, 
  CCardBody, 
  CCardHeader, 
  CCardTitle,
  CCol, 
  CRow, 
  CButton,
  CSpinner,
  CAlert,
  CBadge,
  CWidgetStatsF
} from '@coreui/react';

// Devextreme Chart imports - fixed imports
import Chart from 'devextreme-react/chart';
import {
  Series,
  ArgumentAxis,
  ValueAxis,
  Legend,
  Tooltip,
  CommonSeriesSettings
} from 'devextreme-react/chart';

// Devextreme TabPanel - fixed as default export
import TabPanel from 'devextreme-react/tab-panel';
import { Item } from 'devextreme-react/tab-panel';

// Devextreme DataGrid
import DataGrid from 'devextreme-react/data-grid';
import {
  Column,
  Paging,
  Selection,
  FilterRow,
  HeaderFilter
} from 'devextreme-react/data-grid';

// Devextreme CircularGauge - fixed as CircularGauge
import { CircularGauge } from 'devextreme-react/circular-gauge';
import {
  Scale,
  Label,
  RangeContainer,
  Range
} from 'devextreme-react/circular-gauge';

const MeteoblueWeatherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const API_URL = 'https://my.meteoblue.com/packages/basic-15min_basic-day_current_clouds-15min_sunmoon_moonlight-15min?apikey=WT1PeLgQ9C802njY&lat=31.558&lon=74.3507&asl=216&format=json';

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch weather data');
      const jsonData = await response.json();
      setData(jsonData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <CSpinner color="primary" style={{ width: '4rem', height: '4rem' }} />
          <h4 className="mt-3">Loading Weather Data...</h4>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CAlert color="danger" className="d-flex align-items-center">
              <div className="flex-grow-1">
                <h4 className="alert-heading">Error Loading Data</h4>
                <p className="mb-0">{error}</p>
              </div>
            </CAlert>
            <CButton color="primary" onClick={fetchWeatherData} className="w-100">
              Retry
            </CButton>
          </CCol>
        </CRow>
      </div>
    );
  }

  if (!data) return null;

  const currentData = data.data_current;
  const xminData = data.data_xmin;
  const dayData = data.data_day;
  const metadata = data.metadata;

  // Prepare chart data for temperature trend (next 12 hours)
  const temperatureChartData = xminData.time.slice(0, 48).map((time, idx) => ({
    time: time.split(' ')[1],
    temperature: xminData.temperature[idx],
    humidity: xminData.relativehumidity[idx]
  }));

  // Prepare chart data for wind speed
  const windChartData = xminData.time.slice(0, 48).map((time, idx) => ({
    time: time.split(' ')[1],
    windspeed: xminData.windspeed[idx]
  }));

  // Prepare daily forecast grid data
  const dailyForecastData = dayData.time.map((date, idx) => ({
    id: idx,
    date: date,
    dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
    tempMax: dayData.temperature_max[idx],
    tempMin: dayData.temperature_min[idx],
    precipitation: dayData.precipitation[idx],
    windspeed: dayData.windspeed_mean[idx],
    humidity: dayData.relativehumidity_mean[idx],
    uvindex: dayData.uvindex[idx],
    sunrise: dayData.sunrise[idx],
    sunset: dayData.sunset[idx],
    moonphase: dayData.moonphasename[idx]
  }));

  const getWindDirection = (deg) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
  };

  const selectedTimeData = {
    time: xminData.time[selectedTimeIndex],
    temperature: xminData.temperature[selectedTimeIndex],
    windspeed: xminData.windspeed[selectedTimeIndex],
    winddir: xminData.winddirection[selectedTimeIndex],
    humidity: xminData.relativehumidity[selectedTimeIndex],
    cloudcover: xminData.totalcloudcover[selectedTimeIndex],
    precipitation: xminData.precipitation[selectedTimeIndex],
    visibility: xminData.visibility[selectedTimeIndex],
    pressure: xminData.sealevelpressure[selectedTimeIndex]
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <CRow className="mb-4">
        <CCol>
          <CCard className="border-0 shadow-sm">
            <CCardBody className="text-center py-4">
              <h1 className="display-4 fw-bold text-primary mb-2">
                🌤️ Weather Dashboard
              </h1>
              <h4 className="text-muted mb-2">
                {metadata.name || 'Lahore'}, {metadata.timezone_abbrevation}
              </h4>
              <CBadge color="info" className="px-3 py-2">
                Last Updated: {metadata.modelrun_updatetime_utc} UTC
              </CBadge>
              <CButton 
                color="primary" 
                size="sm" 
                className="ms-3"
                onClick={fetchWeatherData}
              >
                🔄 Refresh
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Current Weather Widgets */}
      <CRow className="mb-4">
        <CCol sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            color="primary"
            icon={<span style={{ fontSize: '2rem' }}>🌡️</span>}
            title="Temperature"
            value={`${currentData.temperature.toFixed(1)}°C`}
            footer={
              <div className="text-medium-emphasis">
                {currentData.isdaylight ? '☀️ Daytime' : '🌙 Nighttime'}
              </div>
            }
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            color="info"
            icon={<span style={{ fontSize: '2rem' }}>💨</span>}
            title="Wind Speed"
            value={`${currentData.windspeed.toFixed(1)} m/s`}
            footer={
              <div className="text-medium-emphasis">
                Current wind conditions
              </div>
            }
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            color="success"
            icon={<span style={{ fontSize: '2rem' }}>👁️</span>}
            title="Visibility"
            value="Good"
            footer={
              <div className="text-medium-emphasis">
                Pictocode: {currentData.pictocode}
              </div>
            }
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            color="warning"
            icon={<span style={{ fontSize: '2rem' }}>🌅</span>}
            title="Zenith Angle"
            value={`${currentData.zenithangle.toFixed(1)}°`}
            footer={
              <div className="text-medium-emphasis">
                Solar position
              </div>
            }
          />
        </CCol>
      </CRow>

      {/* Gauges for Selected Time */}
      <CRow className="mb-4">
        <CCol lg={3} md={6} className="mb-4">
          <CCard className="border-0 shadow-sm">
            <CCardHeader className="bg-white">
              <CCardTitle className="mb-0">Temperature</CCardTitle>
            </CCardHeader>
            <CCardBody className="text-center">
              <CircularGauge 
                id="temperature-gauge" 
                value={selectedTimeData.temperature}
                style={{ height: '250px' }}
              >
                <Scale startValue={-10} endValue={50}>
                  <Label customizeText={(arg) => `${arg.valueText}°C`} />
                </Scale>
                <RangeContainer>
                  <Range startValue={-10} endValue={0} color="#5cb3fd" />
                  <Range startValue={0} endValue={15} color="#a7d1f5" />
                  <Range startValue={15} endValue={30} color="#fdb45c" />
                  <Range startValue={30} endValue={50} color="#f4516c" />
                </RangeContainer>
              </CircularGauge>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={3} md={6} className="mb-4">
          <CCard className="border-0 shadow-sm">
            <CCardHeader className="bg-white">
              <CCardTitle className="mb-0">Humidity</CCardTitle>
            </CCardHeader>
            <CCardBody className="text-center">
              <CircularGauge 
                id="humidity-gauge" 
                value={selectedTimeData.humidity}
                style={{ height: '250px' }}
              >
                <Scale startValue={0} endValue={100}>
                  <Label customizeText={(arg) => `${arg.valueText}%`} />
                </Scale>
                <RangeContainer>
                  <Range startValue={0} endValue={30} color="#fdb45c" />
                  <Range startValue={30} endValue={60} color="#a7d1f5" />
                  <Range startValue={60} endValue={100} color="#5cb3fd" />
                </RangeContainer>
              </CircularGauge>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={3} md={6} className="mb-4">
          <CCard className="border-0 shadow-sm">
            <CCardHeader className="bg-white">
              <CCardTitle className="mb-0">Wind Speed</CCardTitle>
            </CCardHeader>
            <CCardBody className="text-center">
              <CircularGauge 
                id="wind-gauge" 
                value={selectedTimeData.windspeed}
                style={{ height: '250px' }}
              >
                <Scale startValue={0} endValue={20}>
                  <Label customizeText={(arg) => `${arg.valueText} m/s`} />
                </Scale>
                <RangeContainer>
                  <Range startValue={0} endValue={5} color="#4bc0c0" />
                  <Range startValue={5} endValue={10} color="#fdb45c" />
                  <Range startValue={10} endValue={20} color="#f4516c" />
                </RangeContainer>
              </CircularGauge>
              <div className="mt-2">
                <CBadge color="info" className="px-3 py-2">
                  Direction: {getWindDirection(selectedTimeData.winddir)}
                </CBadge>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={3} md={6} className="mb-4">
          <CCard className="border-0 shadow-sm">
            <CCardHeader className="bg-white">
              <CCardTitle className="mb-0">Cloud Cover</CCardTitle>
            </CCardHeader>
            <CCardBody className="text-center">
              <CircularGauge 
                id="cloud-gauge" 
                value={selectedTimeData.cloudcover}
                style={{ height: '250px' }}
              >
                <Scale startValue={0} endValue={100}>
                  <Label customizeText={(arg) => `${arg.valueText}%`} />
                </Scale>
                <RangeContainer>
                  <Range startValue={0} endValue={25} color="#4bc0c0" />
                  <Range startValue={25} endValue={75} color="#a7d1f5" />
                  <Range startValue={75} endValue={100} color="#9b9b9b" />
                </RangeContainer>
              </CircularGauge>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Charts Section */}
      <CRow className="mb-4">
        <CCol lg={6} className="mb-4">
          <CCard className="border-0 shadow-sm">
            <CCardHeader className="bg-white">
              <CCardTitle className="mb-0">📊 Temperature & Humidity (12h)</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <Chart 
                id="temperature-chart" 
                dataSource={temperatureChartData}
                style={{ height: '350px' }}
              >
                <CommonSeriesSettings argumentField="time" />
                <Series 
                  valueField="temperature" 
                  name="Temperature (°C)" 
                  color="#f4516c"
                  type="spline"
                />
                <Series 
                  valueField="humidity" 
                  name="Humidity (%)" 
                  color="#5cb3fd"
                  type="spline"
                />
                <ArgumentAxis />
                <ValueAxis />
                <Legend verticalAlignment="bottom" horizontalAlignment="center" />
                <Tooltip enabled={true} />
              </Chart>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={6} className="mb-4">
          <CCard className="border-0 shadow-sm">
            <CCardHeader className="bg-white">
              <CCardTitle className="mb-0">💨 Wind Speed Trend (12h)</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <Chart 
                id="wind-chart" 
                dataSource={windChartData}
                style={{ height: '350px' }}
              >
                <Series 
                  argumentField="time"
                  valueField="windspeed" 
                  name="Wind Speed (m/s)" 
                  color="#4bc0c0"
                  type="area"
                />
                <ArgumentAxis />
                <ValueAxis />
                <Legend verticalAlignment="bottom" horizontalAlignment="center" />
                <Tooltip enabled={true} />
              </Chart>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Tab Panel for Detailed Data */}
      <CRow>
        <CCol>
          <CCard className="border-0 shadow-sm">
            <CCardBody className="p-0">
              <TabPanel
                height={500}
                animationEnabled={true}
                swipeEnabled={true}
              >
                <Item title="📅 7-Day Forecast">
                  <div className="p-3">
                    <DataGrid
                      dataSource={dailyForecastData}
                      keyExpr="id"
                      showBorders={true}
                      rowAlternationEnabled={true}
                      columnAutoWidth={true}
                      onSelectionChanged={(e) => {
                        if (e.selectedRowsData.length > 0) {
                          setSelectedDayIndex(e.selectedRowsData[0].id);
                        }
                      }}
                    >
                      <Selection mode="single" />
                      <FilterRow visible={true} />
                      <HeaderFilter visible={true} />
                      <Paging enabled={false} />
                      
                      <Column 
                        dataField="dayName" 
                        caption="Day" 
                        width={120}
                      />
                      <Column 
                        dataField="date" 
                        caption="Date" 
                        dataType="date"
                      />
                      <Column 
                        dataField="tempMax" 
                        caption="Max Temp (°C)" 
                        dataType="number"
                        format="#0.0"
                      />
                      <Column 
                        dataField="tempMin" 
                        caption="Min Temp (°C)" 
                        dataType="number"
                        format="#0.0"
                      />
                      <Column 
                        dataField="precipitation" 
                        caption="Precipitation (mm)" 
                        dataType="number"
                        format="#0.0"
                      />
                      <Column 
                        dataField="windspeed" 
                        caption="Wind (m/s)" 
                        dataType="number"
                        format="#0.0"
                      />
                      <Column 
                        dataField="humidity" 
                        caption="Humidity (%)" 
                        dataType="number"
                      />
                      <Column 
                        dataField="uvindex" 
                        caption="UV Index" 
                        dataType="number"
                      />
                      <Column 
                        dataField="sunrise" 
                        caption="Sunrise" 
                      />
                      <Column 
                        dataField="sunset" 
                        caption="Sunset" 
                      />
                      <Column 
                        dataField="moonphase" 
                        caption="Moon Phase" 
                      />
                    </DataGrid>
                  </div>
                </Item>

                <Item title="⏰ 15-Min Intervals">
                  <div className="p-3">
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {xminData.time.slice(0, 48).map((time, idx) => (
                        <CButton
                          key={idx}
                          color={selectedTimeIndex === idx ? 'primary' : 'light'}
                          size="sm"
                          onClick={() => setSelectedTimeIndex(idx)}
                        >
                          {time.split(' ')[1]}
                        </CButton>
                      ))}
                    </div>
                    
                    <CRow className="g-3">
                      <CCol md={6}>
                        <div className="p-3 bg-light rounded">
                          <strong>🕐 Time:</strong> {selectedTimeData.time}
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <div className="p-3 bg-light rounded">
                          <strong>🌡️ Temperature:</strong> {selectedTimeData.temperature.toFixed(1)}°C
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <div className="p-3 bg-light rounded">
                          <strong>💧 Humidity:</strong> {selectedTimeData.humidity}%
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <div className="p-3 bg-light rounded">
                          <strong>☁️ Cloud Cover:</strong> {selectedTimeData.cloudcover}%
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <div className="p-3 bg-light rounded">
                          <strong>🌧️ Precipitation:</strong> {selectedTimeData.precipitation.toFixed(1)} mm
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <div className="p-3 bg-light rounded">
                          <strong>👁️ Visibility:</strong> {(selectedTimeData.visibility / 1000).toFixed(1)} km
                        </div>
                      </CCol>
                      <CCol md={6}>
                        <div className="p-3 bg-light rounded">
                          <strong>🎚️ Pressure:</strong> {selectedTimeData.pressure.toFixed(0)} hPa
                        </div>
                      </CCol>
                    </CRow>
                  </div>
                </Item>

                <Item title="📊 Raw Data">
                  <div className="p-3">
                    <CAlert color="info">
                      <strong>API Endpoint:</strong> {API_URL.substring(0, 80)}...
                    </CAlert>
                    <pre className="bg-light p-3 rounded" style={{ maxHeight: '350px', overflow: 'auto' }}>
                      {JSON.stringify(metadata, null, 2)}
                    </pre>
                  </div>
                </Item>
              </TabPanel>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
};

export default MeteoblueWeatherDashboard;