import React, { useState, useEffect } from 'react';
import Dashboard from './views/Dashboard';
import Editor from './views/Editor';
import { UserProfile, ReferenceAuthor } from './types';

// Mock Authors Data - The "Public Domain" Library
const INITIAL_AUTHORS: ReferenceAuthor[] = [
  {
    id: 'hemingway',
    name: 'Ernest Hemingway',
    description: 'Direct, vigorous, and unadorned.',
    traits: ['Concise', 'Stoic', 'Journalistic'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Ernest+Hemingway&background=333&color=fff&bold=true&length=2',
    category: 'Fiction'
  },
  {
    id: 'woolf',
    name: 'Virginia Woolf',
    description: 'Lyrical, stream-of-consciousness, introspective.',
    traits: ['Fluid', 'Impressionist', 'Internal'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Virginia+Woolf&background=8b5cf6&color=fff&bold=true&length=2',
    category: 'Fiction'
  },
  {
    id: 'sorkin',
    name: 'Aaron Sorkin',
    description: 'Rhythmic, witty, and fast-paced dialogue.',
    traits: ['Snappy', 'Intellectual', 'Repetitive'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Aaron+Sorkin&background=0ea5e9&color=fff&bold=true&length=2',
    category: 'Screenwriting'
  },
  {
    id: 'pg',
    name: 'Paul Graham',
    description: 'Clear, argumentative, and conversational essayist.',
    traits: ['Logic-driven', 'Plain', 'Insightful'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Paul+Graham&background=f59e0b&color=fff&bold=true&length=2',
    category: 'Non-Fiction'
  },
  {
    id: 'didion',
    name: 'Joan Didion',
    description: 'Cool, detached, observational elegance.',
    traits: ['Precise', 'Detached', 'Observational'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Joan+Didion&background=10b981&color=fff&bold=true&length=2',
    category: 'Journalism'
  },
  {
    id: 'orwell',
    name: 'George Orwell',
    description: 'Political, plain-spoken, anti-pretension.',
    traits: ['Political', 'Clear', 'Direct'],
    avatarUrl: 'https://ui-avatars.com/api/?name=George+Orwell&background=f43f5e&color=fff&bold=true&length=2',
    category: 'Non-Fiction'
  },
  {
    id: 'oliver',
    name: 'Mary Oliver',
    description: 'Naturalistic, spiritual, accessible clarity.',
    traits: ['Nature-focused', 'Simple', 'Profound'],
    avatarUrl: 'https://ui-avatars.com/api/?name=Mary+Oliver&background=6366f1&color=fff&bold=true&length=2',
    category: 'Poetry'
  }
];

const INITIAL_PROFILE: UserProfile = {
  name: 'User',
  hasAnalyzedSamples: false,
  baseStyle: {
    vocabularyComplexity: 50,
    sentenceVariety: 50,
    formality: 50,
    imagery: 50,
    warmth: 50,
    pacing: 50
  },
  sampleText: ''
};

enum View {
  DASHBOARD,
  EDITOR
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  
  // Initialize Custom Authors from Local Storage (Simulating User Database)
  const [customAuthors, setCustomAuthors] = useState<ReferenceAuthor[]>(() => {
    try {
      const saved = localStorage.getItem('writemeta_custom_authors');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load custom authors", e);
      return [];
    }
  });

  const [sessionAuthors, setSessionAuthors] = useState<ReferenceAuthor[]>([]);

  // Combine custom authors (User Library) with default authors (System Library)
  // Order: Session (Newest) -> Custom (Saved) -> Initial
  const allAuthors = [...sessionAuthors, ...customAuthors, ...INITIAL_AUTHORS];

  const handleAddAuthor = (newAuthor: ReferenceAuthor, persist: boolean) => {
    if (persist) {
        const updatedCustom = [newAuthor, ...customAuthors];
        setCustomAuthors(updatedCustom);
        // Persist to "Database"
        localStorage.setItem('writemeta_custom_authors', JSON.stringify(updatedCustom));
    } else {
        setSessionAuthors(prev => [newAuthor, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-paper font-sans text-ink selection:bg-industrial-orange selection:text-white">
      {currentView === View.DASHBOARD && (
        <Dashboard 
          userProfile={userProfile}
          onUpdateProfile={setUserProfile}
          onNavigateToEditor={() => setCurrentView(View.EDITOR)}
        />
      )}

      {currentView === View.EDITOR && (
        <Editor 
          userProfile={userProfile}
          authors={allAuthors}
          onAddAuthor={handleAddAuthor}
          onBack={() => setCurrentView(View.DASHBOARD)}
        />
      )}
    </div>
  );
};

export default App;