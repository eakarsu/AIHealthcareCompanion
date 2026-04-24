import ReactMarkdown from 'react-markdown';
import { Sparkles, Brain, CheckCircle, AlertTriangle, Info, Lightbulb } from 'lucide-react';

export default function AIResponseDisplay({ response, loading, error }) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <Brain className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">AI is analyzing...</p>
          <p className="text-sm text-gray-500">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800 mb-1">Analysis Error</h4>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return null;
  }

  // Strip triple backticks from AI response
  const cleanedResponse = stripCodeBlocks(response);

  // Parse sections from the response
  const sections = parseAIResponse(cleanedResponse);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl border border-blue-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">AI Analysis Results</h3>
            <p className="text-blue-100 text-sm">Powered by Claude AI</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {sections.length > 0 ? (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <Section key={index} section={section} />
            ))}
          </div>
        ) : (
          <div className="ai-response prose prose-blue max-w-none">
            <ReactMarkdown>{cleanedResponse}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="px-6 pb-6">
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice.
              Always consult with qualified healthcare providers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ section }) {
  const getIcon = () => {
    const title = section.title.toLowerCase();
    if (title.includes('warning') || title.includes('risk') || title.includes('concern')) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    if (title.includes('recommendation') || title.includes('tip')) {
      return <Lightbulb className="w-5 h-5 text-yellow-500" />;
    }
    if (title.includes('safe') || title.includes('good') || title.includes('normal')) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  const getBgColor = () => {
    const title = section.title.toLowerCase();
    if (title.includes('warning') || title.includes('risk') || title.includes('concern')) {
      return 'bg-red-50 border-red-100';
    }
    if (title.includes('recommendation') || title.includes('tip')) {
      return 'bg-yellow-50 border-yellow-100';
    }
    if (title.includes('safe') || title.includes('good') || title.includes('normal')) {
      return 'bg-green-50 border-green-100';
    }
    return 'bg-white border-gray-100';
  };

  return (
    <div className={`rounded-xl p-4 border ${getBgColor()}`}>
      <div className="flex items-center gap-2 mb-3">
        {getIcon()}
        <h4 className="font-semibold text-gray-800">{section.title}</h4>
      </div>
      <div className="ai-response prose prose-sm max-w-none">
        <ReactMarkdown>{section.content}</ReactMarkdown>
      </div>
    </div>
  );
}

function stripCodeBlocks(text) {
  if (!text) return text;
  // Remove ```language and ``` markers, keeping the content inside
  return text.replace(/```[\w]*\n?/g, '').trim();
}

function parseAIResponse(text) {
  const sections = [];
  const lines = text.split('\n');
  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    // Check for section headers (## or ### or numbered headers like "1." or "**Title:**")
    const headerMatch = line.match(/^#{1,3}\s+(.+)$/) ||
                       line.match(/^\d+\.\s+\*\*(.+?)\*\*/) ||
                       line.match(/^\*\*(.+?)\*\*:?\s*$/);

    if (headerMatch) {
      // Save previous section
      if (currentSection) {
        sections.push({
          title: currentSection,
          content: currentContent.join('\n').trim()
        });
      }
      currentSection = headerMatch[1].replace(/\*\*/g, '').replace(/:$/, '');
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    } else {
      // Content before first header
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    sections.push({
      title: currentSection,
      content: currentContent.join('\n').trim()
    });
  }

  return sections;
}
