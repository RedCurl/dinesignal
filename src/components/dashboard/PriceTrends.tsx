import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceEvent {
  id: number;
  restaurant: string;
  item: string;
  change: number; // positive = increase, negative = decrease
  date: string;
}

const EVENTS: PriceEvent[] = [
  { id: 1, restaurant: "Oren's Hummus", item: 'Falafel Plate', change: 1.5, date: 'Mar 2' },
  { id: 2, restaurant: 'Tamarine', item: 'Lunch Special', change: -0.5, date: 'Feb 28' },
  { id: 3, restaurant: 'Nobu Palo Alto', item: 'Omakase Set', change: 5.0, date: 'Feb 25' },
  { id: 4, restaurant: 'Evvia Estiatorio', item: 'Grilled Lamb', change: 2.0, date: 'Feb 20' },
  { id: 5, restaurant: 'Burma Love', item: 'Tea Leaf Salad', change: -1.0, date: 'Feb 15' },
];

export default function PriceTrends() {
  return (
    <div className="bg-gray-900/70 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-5 rounded-full bg-orange-500" />
        <h3 className="text-lg font-bold text-gray-50">Recent Market Activity</h3>
      </div>

      <div className="space-y-3">
        {EVENTS.map((e) => {
          const isIncrease = e.change > 0;
          return (
            <div
              key={e.id}
              className="flex items-start gap-3 py-2 border-b border-gray-800/40 last:border-b-0"
            >
              <div
                className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                  isIncrease ? 'bg-red-500' : 'bg-green-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200">
                  <span className="font-medium">{e.restaurant}</span>{' '}
                  <span className="text-gray-400">
                    {isIncrease ? 'raised' : 'lowered'}{' '}
                  </span>
                  <span className="text-gray-300">{e.item}</span>{' '}
                  <span className="text-gray-400">by </span>
                  <span
                    className={`font-mono ${isIncrease ? 'text-red-400' : 'text-green-400'}`}
                  >
                    ${Math.abs(e.change).toFixed(2)}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {isIncrease ? (
                  <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-green-400" />
                )}
                <span className="text-xs text-gray-500">{e.date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
