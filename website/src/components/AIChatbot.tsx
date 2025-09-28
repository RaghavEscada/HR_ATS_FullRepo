import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageCircle, 
  X, 
  Bot,
  Sparkles,
  Minimize2,
  Maximize2
} from 'lucide-react';
import LiveKitWidget from '@/components/ai_avatar/LiveKitWidget';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card className={`w-[600px] shadow-2xl border-black/20 bg-white transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[700px]'
        }`}>
          <CardContent className="p-0 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-black/10 bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-black text-base">AI Avatar Assistant</h3>
                  <p className="text-xs text-gray-600">Live Voice & Video Support</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 p-0 hover:bg-gray-100 text-black"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-100 text-black"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <div className="flex-1 overflow-hidden">
                <LiveKitWidget setShowSupport={setIsOpen} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen 
            ? 'bg-black hover:bg-gray-800' 
            : 'bg-black hover:bg-gray-800 hover:scale-110'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse">
              <Sparkles className="w-2 h-2 text-black absolute top-0.5 left-0.5" />
            </div>
          </div>
        )}
      </Button>
    </div>
  );
};

export default AIChatbot;