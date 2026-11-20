import { useSearchParams } from 'react-router-dom'

/**
 * Filtre par type gardé dans l'adresse (?type=...), pour qu'un lien ou une redirection
 * ouvre directement la bonne vue. La valeur par défaut n'apparaît pas dans l'adresse.
 */
export const useTypeFilter = <T extends string>(fallback: T) => {
  const [params, setParams] = useSearchParams()
  const active = (params.get('type') as T | null) ?? fallback

  const setType = (type: T) => {
    const next = new URLSearchParams(params)
    if (type === fallback) next.delete('type')
    else next.set('type', type)
    setParams(next, { replace: true })
  }

  return [active, setType] as const
}
