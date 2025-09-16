import React, { Component } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
];

// Custom Tooltip with fade-in and color squares
const CustomTooltip = ({ active, payload, label }) => {
  return (
    <div
      style={{
        opacity: active ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        backgroundColor: 'rgba(200, 200, 200, 0.5)',
        borderRadius: '12px',
        padding: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        pointerEvents: 'none',
      }}
    >
      {active && payload && payload.length > 0 && (
        <>
          <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
            <div
              key={`item-${index}`}
              style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  display: 'inline-block',
                  backgroundColor: entry.color,
                  marginRight: 6,
                  borderRadius: 2,
                }}
              ></span>
              <span>{`${entry.name}: ${entry.value}`}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

class AreaReExample extends Component {

  // componentDidMount(){
  //   // console.log(localStorage.getItem("accessToken"));
     
  // }

  render() {
    return (
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="uv" stackId="1" stroke="#8884d8" fill="#8884d8" />
            <Area type="monotone" dataKey="pv" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
            <Area type="monotone" dataKey="amt" stackId="1" stroke="#ffc658" fill="#ffc658" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

export default AreaReExample;
