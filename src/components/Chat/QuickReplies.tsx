import { Button } from '@/components/ui/button';

interface QuickRepliesProps {
  onSelect: (text: string) => void;
}

const QuickReplies = ({ onSelect }: QuickRepliesProps) => {
  const replies = [
    "Yes",
    "No",
    "Maybe",
    "What time?",
    "Where?",
    "Is this still available?",
    "On my way!"
  ];

  return (
    <div className="px-4 py-2 border-t bg-background/95 backdrop-blur overflow-x-auto">
      <div className="flex gap-2 min-w-max">
        {replies.map((reply) => (
          <Button
            key={reply}
            variant="outline"
            size="sm"
            onClick={() => onSelect(reply)}
            className="flex-shrink-0 text-xs"
          >
            {reply}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickReplies;
