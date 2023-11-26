import React from 'react';

interface CharacterProps {
  avatar: string;
  nickname: string;
  characteristics: { name: string, amount: number }[];
}

const Character: React.FC<CharacterProps> = ({ avatar, nickname, characteristics }) => {
  return (
    <div>
      <img src={avatar} alt="avatar" />
      <p>Nickname: {nickname}</p>
      <ul>
        {characteristics.map((char, index) => (
            <li key={index}>{char.name}: {char.amount}</li>
        ))}
      </ul>
    </div>
    );
};

export default Character;
