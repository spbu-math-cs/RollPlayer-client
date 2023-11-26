import React, { useState } from 'react';

interface CharacterInfoProps {
  nickname: string;
  canChange: boolean;
  onNameChanged?: (newName: string) => void;
}

const CharacterInfo: React.FC<CharacterInfoProps> = ({ nickname, canChange, onNameChanged }) => {
  const [newNickname, setNewNickname] = useState('');

  const handleNameChange = () => {
    if (onNameChanged) {
      onNameChanged(newNickname);
    }
  };

  return (
    <div>
      <p>Nickname: {canChange ?
        <input type="text" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} /> :
          nickname
      }</p>
        {canChange && <button onClick={handleNameChange}>Change Name</button>}
    </div>
  );
};

export default CharacterInfo;
