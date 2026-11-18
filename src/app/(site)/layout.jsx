import SiteFrame from '@/components/SiteFrame'

const introScript = `(function(){try{var path=location.pathname;if(path!=='/'&&path!=='')return;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;if(sessionStorage.getItem('jp-intro-seen'))return;document.documentElement.classList.add('intro-pending')}catch(e){}})()`

export default function SiteLayout({ children }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: introScript }} />
      <SiteFrame>{children}</SiteFrame>
    </>
  )
}
