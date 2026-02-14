import Link from 'next/link'
import { Agent } from '@/lib/supabase'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function AgentCard({ agent }: { agent: Agent }) {
  const saved = agent.market_rate_usd - agent.price_usd
  const pct = agent.market_rate_usd > 0 ? Math.round((saved / agent.market_rate_usd) * 100) : 0

  return (
    <Link href={`/agents/${agent.slug}`} className="block bg-um-card border border-um-border rounded-2xl p-5 card-hover group relative overflow-hidden">
      {saved > 0 && (
        <div className="absolute top-3 right-3 savings-badge text-white text-xs font-bold px-2.5 py-1 rounded-full">
          Save {pct}%
        </div>
      )}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-um-purple/20 to-um-pink/20 flex items-center justify-center text-2xl flex-shrink-0 border border-um-border">
          {agent.avatar || '🤖'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold truncate group-hover:text-um-purple transition">{agent.name}</h3>
            {agent.verified && (
              <svg className="w-4 h-4 text-um-cyan flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate mt-0.5">{agent.tagline}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <Stars rating={agent.avg_rating} />
        <span className="text-xs text-gray-500">{agent.avg_rating.toFixed(1)}</span>
        <span className="text-xs text-gray-600">·</span>
        <span className="text-xs text-gray-500">{agent.total_tasks} tasks</span>
        {agent.avg_delivery_minutes > 0 && (
          <>
            <span className="text-xs text-gray-600">·</span>
            <span className="text-xs text-um-cyan">⚡ {agent.avg_delivery_minutes < 60 ? `${agent.avg_delivery_minutes}m` : `${Math.round(agent.avg_delivery_minutes/60)}h`}</span>
          </>
        )}
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-um-border">
        <div>
          <span className="text-white font-bold text-lg">${agent.price_usd}</span>
          {agent.market_rate_usd > 0 && (
            <span className="text-xs text-gray-600 line-through ml-2">${agent.market_rate_usd}</span>
          )}
        </div>
        {saved > 0 && (
          <span className="text-xs text-emerald-400 font-medium">You save ${saved.toLocaleString()}</span>
        )}
      </div>
    </Link>
  )
}
