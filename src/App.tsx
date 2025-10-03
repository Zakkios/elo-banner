import { PageHero } from './components/layout/PageHero'
import { PageLayout } from './components/layout/PageLayout'
import { SummonerSearchSection } from './features/summoner-search'

function App() {
  return (
    <PageLayout
      header={
        <PageHero
          title="Elo Banner"
          subtitle="Donnez vie a votre progression sur League of Legends"
          description={
            <p className="text-base text-slate-200/70">
              Entrez un pseudo et preparez-vous a generer une bannere partageable, adaptee automatiquement a son Elo.
            </p>
          }
        />
      }
      footer={<p className="text-sm text-slate-200/70">Concu pour la communaute League of Legends.</p>}
    >
      <SummonerSearchSection />
    </PageLayout>
  )
}

export default App
