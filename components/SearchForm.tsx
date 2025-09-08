import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchFormProps } from '@/types';

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      onSearch(keyword);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
      <Input
        type="text"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        placeholder="请输入关键词..."
        required
        className="flex-grow"
      />
      <Button variant="default" type="submit">
        搜索
      </Button>
    </form>
  );
};

export default SearchForm;
