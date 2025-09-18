
import React from 'react';
import { CountrySelector } from './CountrySelector';
import type { ChatMessage } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';

interface MessageProps {
  message: ChatMessage;
  onReportExpired: (code: string) => void;
  onFeedback: (messageId: string, feedback: 'correct' | 'incorrect') => void;
  onCountrySelect?: (messageId: string, country: string) => void;
}

const applyMarkdown = (text: string): string => {
  if (!text) return '';
  let html = text.trim();

  // Linkify HTS codes, chapters, and headings.
  const htsLinkClass = "font-medium text-blue-600 dark:text-blue-400 hover:underline";
  
  const createHtsLink = (code: string) => 
    `<a href="https://hts.usitc.gov/current?query=${code.replace(/\./g, '')}" target="_blank" rel="noopener noreferrer" class="${htsLinkClass}">${code}</a>`;

  // Enhanced regex to capture various HTS code formats, including with/without periods.
  const htsCodeRegex = /\b(\d{4}\.\d{2}\.\d{4}|\d{10}|\d{4}\.\d{2}\.\d{2}|\d{8}|\d{4}\.\d{2}|\d{6})\b/g;

  html = html.replace(htsCodeRegex, (match) => {
    let formattedCode = match;
    // If the matched code is purely numeric, add periods for better readability.
    if (!match.includes('.')) {
      if (match.length === 10) {
        formattedCode = `${match.substring(0, 4)}.${match.substring(4, 6)}.${match.substring(6, 10)}`;
      } else if (match.length === 8) {
        formattedCode = `${match.substring(0, 4)}.${match.substring(4, 6)}.${match.substring(6, 8)}`;
      } else if (match.length === 6) {
        formattedCode = `${match.substring(0, 4)}.${match.substring(4, 6)}`;
      }
    }
    return createHtsLink(formattedCode);
  });
  
  const headingRegex = /\b(Heading\s+)(\d{4})\b(?!\.)/gi;
  html = html.replace(headingRegex, (_, prefix, code) => `${prefix}${createHtsLink(code)}`);

  const chapterRegex = /\b(Chapter\s+)(\d{2})\b(?!\.)/gi;
  html = html.replace(chapterRegex, (_, prefix, code) => `${prefix}${createHtsLink(code)}`);

  // Linkify CROSS Ruling Numbers
  const rulingRegex = /\b(N\d{6}|H\d{6}|HQ\s?\d{6}|\d{6})\b/gi;
  html = html.replace(rulingRegex, (match) => {
    const rulingId = match.replace(/\s/g, '');
    return `<a href="https://rulings.cbp.gov/ruling/${rulingId}" target="_blank" rel="noopener noreferrer" class="font-medium text-blue-600 dark:text-blue-400 hover:underline">${match}</a>`;
  });

  // Basic markdown
  // Strong and emphasis transformations
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/^\s*\*\s(.*$)/gim, '<ul class="list-disc list-inside pl-2"><li class="mb-1">$1</li></ul>');
  html = html.replace(/^\s*\d+\.\s(.*$)/gim, '<ol class="list-decimal list-inside pl-2"><li class="mb-1">$1</li></ol>');
  html = html.replace(/<\/ul>\s*<ul class="list-disc list-inside pl-2">/g, '');
  html = html.replace(/<\/ol>\s*<ol class="list-decimal list-inside pl-2">/g, '');
  // Preserve line breaks but keep paragraphs intact
  html = html.replace(/\n\n/g, '</p><p>');
  html = `<p>${html.replace(/\n/g, '<br />')}</p>`;
  if (html.startsWith('<br />')) {
    html = html.substring(6);
  }
  
  return html;
};

const sectionConfig = {
    'Annex Information': {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-indigo-600 dark:text-indigo-400"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75m0-3H21" /></svg>`,
        style: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800'
    },
    'Exclusions & Exceptions': {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-rose-600 dark:text-rose-400"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>`,
        style: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
    },
    // 'Additional Tariffs' duplicate removed to ensure unique property names
    'HTS Code': {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-blue-600 dark:text-blue-400"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z"></path></svg>`,
        style: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
    },
    'Duty Rate': {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-green-600 dark:text-green-400"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6V4.5m0 0a.75.75 0 01.75-.75h15a.75.75 0 01.75.75v.75A.75.75 0 0121 6v-1.5m-17.25 0a.75.75 0 01.75-.75h15a.75.75 0 01.75.75v1.5c0 .414-.336.75-.75.75h-15a.75.75 0 01-.75-.75v-1.5m17.25 0h.008v.008h-.008v-.008zM12 15a.75.75 0 01-.75-.75V11.25a.75.75 0 011.5 0v3a.75.75 0 01-.75.75z" /></svg>`,
        style: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
    },
    'Additional Tariffs': {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-yellow-600 dark:text-yellow-400"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"></path></svg>`,
        style: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-700'
    },
    'Classification Rationale': {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-purple-600 dark:text-purple-400"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.456-2.456L12.75 18l1.178-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456l1.178.398-1.178.398a3.375 3.375 0 00-2.456 2.456z" /></svg>`,
        style: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800'
    },
    'Supporting Notes/Rulings': {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-gray-600 dark:text-gray-400"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.036.218c-2.21 0-4.227-.63-5.882-1.75M5.25 4.97c-1.01.143-2.01.317-3 .52m3-.52L2.62 15.696c-.122.499.106 1.028.589 1.202a5.989 5.989 0 002.036.218c2.21 0 4.227-.63 5.882-1.75" /></svg>`,
        style: 'bg-gray-100 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700'
    },
};

const formatContent = (text: string) => {
  const sectionHeaders = Object.keys(sectionConfig);
  const regex = new RegExp(`\\*\\*(${sectionHeaders.join('|').replace('/', '\\/')})\\*\\*`, 'g');

    const matches = [...text.matchAll(regex)];

    if (matches.length === 0) {
        return { __html: applyMarkdown(text) };
    }

    let html = '';
    
    const introText = text.substring(0, matches[0].index);
    if (introText.trim()) {
        html += `<div class="mb-4 px-4">${applyMarkdown(introText)}</div>`;
    }

    const sections = [];
    for (let i = 0; i < matches.length; i++) {
        const currentMatch = matches[i];
        const nextMatch = matches[i + 1];

        const header = currentMatch[1];
        const config = sectionConfig[header as keyof typeof sectionConfig];

        const startIndex = currentMatch.index + currentMatch[0].length;
        const endIndex = nextMatch ? nextMatch.index : text.length;
        
        const content = text.substring(startIndex, endIndex);
        const formattedContent = applyMarkdown(content);

    sections.push(`
      <div class="p-4 rounded-lg border ${config.style}">
        <div class="flex items-center mb-2">
          ${config.icon}
          <h3 class="ml-3 text-lg font-semibold text-gray-800 dark:text-gray-200">${header}</h3>
        </div>
        <div class="text-sm text-text-dark dark:text-text-light pl-[36px] prose prose-sm dark:prose-invert max-w-none">
          ${formattedContent}
        </div>
      </div>
    `);
    }
    
    html += `<div class="space-y-4">${sections.join('')}</div>`;

    return { __html: html };
};

export const Message: React.FC<MessageProps> = ({ message, onReportExpired, onFeedback, onCountrySelect }) => {
  const isUser = message.role === 'user';
  const hasSections = !isUser && Object.keys(sectionConfig).some(header => message.content.includes(`**${header}**`));

  const handleReportClick = () => {
    // Enhanced regex to find 10-digit HTS codes, with or without periods, for reporting.
    const htsCodeRegex = /\b(\d{4}\.\d{2}\.\d{4}|\d{10})\b/;
    const match = message.content.match(htsCodeRegex);

    if (match && match[0]) {
      const code = match[0];
      // Normalize code to the dotted format for consistency in reporting and user feedback.
      const formattedCode = !code.includes('.')
        ? `${code.substring(0, 4)}.${code.substring(4, 6)}.${code.substring(6, 10)}`
        : code;
      
      if (window.confirm(`Are you sure you want to report HTS code ${formattedCode} as expired? The AI will be instructed not to use it in the future.`)) {
        onReportExpired(formattedCode);
        alert(`HTS code ${formattedCode} has been reported. This will take effect on the next query.`);
      }
    } else {
      alert("No 10-digit HTS code found in this message to report.");
    }
  };

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="relative flex-shrink-0 w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand-primary">
          <BotIcon className="w-6 h-6" />
          {message.isCached && (
            <div className="absolute -bottom-2 -right-2 bg-gray-500 text-white p-1 rounded-full leading-none" title="This response was served from cache for speed.">
              <span className="text-xs">⚡️</span>
            </div>
          )}
        </div>
      )}

      <div className={`max-w-3xl rounded-2xl shadow-md ${hasSections ? 'p-2' : 'p-4'} ${isUser ? 'bg-brand-primary text-white rounded-br-none' : 'bg-white dark:bg-gray-700 rounded-bl-none'}`}>
          {!isUser && message.waitingForCountry && (
            <div className="mb-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg p-6">
              <div className="max-w-xl mx-auto">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Please select the country of import to proceed with HTS analysis:
                </h3>
                <CountrySelector
                  selectedCountry={''}
                  onSelect={(country) => onCountrySelect?.(message.id, country)}
                />
              </div>
            </div>
          )}
        <div
          className="text-text-dark dark:text-text-light" 
          dangerouslySetInnerHTML={isUser ? { __html: `<p>${message.content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>` } : formatContent(message.content)} 
        />
        
        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-600 px-4 pb-2">
            <h4 className="text-xs font-semibold uppercase mb-2 text-gray-500 dark:text-gray-400">Sources</h4>
            <ul className="space-y-1">
              {message.sources.map((source, index) => (
                <li key={index} className="truncate">
                  <a
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {source.title || source.uri}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isUser && hasSections && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 px-4 pb-1 flex justify-between items-center">
             <button
              onClick={handleReportClick}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              title="Report HTS code in this message as expired"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
              Report Expired HTS
            </button>
            
            {message.feedback === null ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Was this response helpful?</span>
                <button
                  onClick={() => onFeedback(message.id, 'correct')}
                  className="p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                  aria-label="Correct response"
                >
                  <ThumbsUpIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onFeedback(message.id, 'incorrect')}
                  className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                  aria-label="Incorrect response"
                >
                  <ThumbsDownIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
               <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 italic">Thank you for your feedback!</span>
                {message.feedback === 'correct' && <ThumbsUpIcon className="w-5 h-5 text-green-500" />}
                {message.feedback === 'incorrect' && <ThumbsDownIcon className="w-5 h-5 text-red-500" />}
              </div>
            )}
          </div>
        )}

      </div>

      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
          <UserIcon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};
