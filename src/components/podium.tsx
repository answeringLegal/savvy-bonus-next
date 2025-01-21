import React from 'react';

const podiumData = [
  {
    name: 'Skulldugger',
    avatar: 'https://via.placeholder.com/64',
    points: 500,
    prize: '5 000',
    position: '2nd',
    height: 'h-32',
    bg: 'bg-gray-700',
  },
  {
    name: 'Klaxxon',
    avatar: 'https://via.placeholder.com/64',
    points: 1500,
    prize: '10 000',
    position: '1st',
    height: 'h-40',
    bg: 'bg-yellow-500',
  },
  {
    name: 'Ultralex',
    avatar: 'https://via.placeholder.com/64',
    points: 250,
    prize: '2 500',
    position: '3rd',
    height: 'h-24',
    bg: 'bg-red-500',
  },
];

const Podium = () => {
  return (
    <div className='perspective-container flex justify-center items-end space-x-10 w-full h-96 mt-10 relative'>
      {podiumData.map((item, index) => (
        <div key={index} className='relative w-28 flex flex-col items-center'>
          {/* Avatar */}
          <img
            src={item.avatar}
            alt={item.name}
            className='w-16 h-16 rounded-full absolute -top-10 border-4 border-gray-800'
          />

          {/* 3D Cube Podium */}
          <div className='cube relative w-28 h-28'>
            <div className={`face front ${item.bg}`}>{item.position}</div>
            <div className='face back'>Back</div>
            <div className='face right'>Side</div>
            <div className='face left'>Side</div>
            <div className='face top'>{item.prize}</div>
            <div className='face bottom'>Base</div>
          </div>

          {/* Name */}
          <div className='text-white font-semibold mt-3'>{item.name}</div>
          {/* Points */}
          <div className='text-gray-300 text-sm'>Earn {item.points} points</div>
        </div>
      ))}
    </div>
  );
};

export default Podium;
