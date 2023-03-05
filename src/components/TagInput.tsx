import React from 'react';
import ReactTagInput from '@pathofdev/react-tag-input';
import './TagInput.tsx.css';

interface IProps {
  value?: string[];
  onChange?: (value: string[]) => void;
}

export const TagInput: React.FC<IProps> = ({ value, onChange }) => {
  const tags = value || [];
  return (
    <div className="tag-input">
      <ReactTagInput
        tags={tags}
        onChange={tags => {
          onChange && onChange(tags);
        }}
        placeholder="Type and press enter..."
      />
    </div>
  );
}

export default TagInput;
