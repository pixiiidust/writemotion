import React from 'react';
import { ReferenceAuthor } from '../types';
import { Check } from 'lucide-react';

interface AuthorCardProps {
  author: ReferenceAuthor;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const AuthorCard: React.FC<AuthorCardProps> = ({ author, isSelected, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(author.id)}
      className={`group relative flex items-start gap-3 p-3 border-2 transition-all duration-100 text-left w-full
        ${isSelected 
          ? 'bg-white border-industrial-orange shadow-[4px_4px_0px_0px_#FF3B00] translate-x-[-2px] translate-y-[-2px]' 
          : 'bg-white border-ink hover:border-industrial-orange hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
        }`}
    >
      <img 
        src={author.avatarUrl} 
        alt={author.name} 
        className={`w-12 h-12 object-cover border border-ink ${isSelected ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
           <h3 className={`font-mono font-bold text-xs uppercase truncate pr-4 ${isSelected ? 'text-industrial-orange' : 'text-ink'}`}>
            {author.name}
          </h3>
        </div>
        <p className="text-[10px] font-mono text-industrial-dim truncate leading-tight mb-2">{author.description}</p>
        
        <div className="flex flex-wrap gap-1">
            <span className="px-1 py-0.5 text-[8px] font-mono font-bold uppercase border border-ink bg-paper text-ink">
                {author.category.substring(0,4)}
            </span>
            {author.traits.slice(0, 1).map((trait) => (
            <span 
                key={trait} 
                className="px-1 py-0.5 text-[8px] font-mono uppercase border border-ink/30 text-industrial-dim"
            >
                {trait}
            </span>
            ))}
        </div>
      </div>

      {isSelected && (
        <div className="absolute top-0 right-0 p-1 bg-industrial-orange text-white">
          <Check size={10} strokeWidth={4} />
        </div>
      )}
    </button>
  );
};

export default AuthorCard;