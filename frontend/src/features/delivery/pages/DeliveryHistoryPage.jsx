import { Link } from 'react-router';
import { FiArrowLeft, FiCheckCircle, FiClock } from 'react-icons/fi';

const DeliveryHistoryPage = () => {
  // Demo history records for rider
  const history = [
    {
      id: 'DEL-8921',
      restaurant: 'Zaika Mughlai Darbar',
      area: 'Bandra West, Mumbai',
      earnings: 65,
      date: 'Today, 1:20 PM',
      duration: '22 mins',
    },
    {
      id: 'DEL-8914',
      restaurant: 'Pizza Romana Gourmet',
      area: 'Khar Danda, Mumbai',
      earnings: 55,
      date: 'Today, 11:45 AM',
      duration: '18 mins',
    },
    {
      id: 'DEL-8876',
      restaurant: 'The Burger Studio',
      area: 'Santacruz East, Mumbai',
      earnings: 75,
      date: 'Yesterday, 8:30 PM',
      duration: '27 mins',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/rider/dashboard"
          className="p-2.5 rounded-xl bg-surface border border-border-subtle hover:border-brand text-text-muted hover:text-text-primary"
        >
          <FiArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-text-primary">Delivery History</h1>
          <p className="text-xs text-text-muted">Your past completed deliveries and trip earnings</p>
        </div>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-surface border border-border-subtle flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary">{item.restaurant}</h4>
                <p className="text-[11px] text-text-muted">{item.area}</p>
                <div className="flex items-center gap-2 text-[10px] text-text-muted mt-1">
                  <span>{item.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <FiClock className="w-3 h-3" /> {item.duration}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-black text-emerald-500">+₹{item.earnings}</span>
              <p className="text-[10px] text-text-muted">Earned</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryHistoryPage;
