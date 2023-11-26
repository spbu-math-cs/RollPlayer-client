import React, {ChangeEvent, useState} from 'react';

const CreateCharacter = () => {
  const [characterName, setCharacterName] = useState('');
  const [characterAvatar, setCharacterAvatar] = useState('');

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCharacterName(e.target.value);
  }

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCharacterAvatar(e.target.value);
  }

  const createCharacter = () => {
    //ToDo: smth
  }

  return (
    <div>
      <input type="text" value={characterName} onChange={handleNameChange} placeholder="Enter character name" />
      <input type="text" value={characterAvatar} onChange={handleAvatarChange} placeholder="Enter character avatar URL" />
      <button onClick={createCharacter}>Create Character</button>
    </div>
  );
}

export default CreateCharacter;
