import React, { useEffect, useState } from 'react';
import { Space, Tag } from 'antd';

const { CheckableTag: AntCheckableTag } = Tag;

interface IProps {
  dataSource: string[],
  value?: string[],
  onChange?: (value: string[]) => void;
  disabled?: boolean;
}

export const CheckableTag: React.FC<IProps> = ({ dataSource, value, onChange, disabled }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(value || []);

  useEffect(() => {
    setSelectedTags(value || []);
  }, [value]);

  const handleChange = (tag: string, checked: boolean) => {
    if (disabled) return;
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t !== tag);
    onChange && onChange(nextSelectedTags);
    setSelectedTags(nextSelectedTags);
  };

  return (
    <>
      <Space size={[0, 8]} wrap>
        {dataSource.map((tag) => (
          <AntCheckableTag
            key={tag}
            checked={selectedTags.includes(tag)}
            onChange={(checked) => handleChange(tag, checked)}
          >
            {tag}
          </AntCheckableTag>
        ))}
      </Space>
    </>
  );
};

export default CheckableTag;
