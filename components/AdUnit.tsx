
import React, { useEffect, useRef } from 'react';
import { useAppData } from '../hooks/useAppData';
import { PLAN_CONFIGS } from '../types';
import { Capacitor } from '@capacitor/core';
// Nota: Certifique-se de rodar 'npm install @capacitor-community/admob'
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

interface AdUnitProps {
  slotId?: string;
  format?: 'banner' | 'rectangle';
  className?: string;
}

// ID do Bloco de Anúncios fornecido
const ADMOB_AD_UNIT_ID = 'ca-app-pub-2788301029310249/5714711006';

export const AdUnit: React.FC<AdUnitProps> = ({ slotId, format = 'banner', className = '' }) => {
  const { subscription } = useAppData();
  const bannerRef = useRef<boolean>(false);
  
  // Verifica se o plano do usuário tem anúncios
  const plan = subscription?.plan || 'free';
  const shouldShowAds = PLAN_CONFIGS[plan].hasAds;

  useEffect(() => {
    // Se for mobile, usuário free e o anúncio ainda não foi carregado
    if (Capacitor.isNativePlatform() && shouldShowAds && !bannerRef.current) {
        initializeAdMob();
    }

    return () => {
        // Limpeza ao desmontar (opcional, dependendo do comportamento desejado no app)
        if (Capacitor.isNativePlatform() && bannerRef.current) {
            AdMob.removeBanner().catch(console.error);
            bannerRef.current = false;
        }
    };
  }, [shouldShowAds]);

  const initializeAdMob = async () => {
      try {
          await AdMob.initialize();
          
          // Solicitamos permissão de rastreamento (importante para iOS 14+)
          // const status = await AdMob.trackingAuthorizationStatus();
          
          await AdMob.showBanner({
              adId: ADMOB_AD_UNIT_ID,
              adSize: BannerAdSize.ADAPTIVE_BANNER,
              position: BannerAdPosition.BOTTOM_CENTER, 
              margin: 0,
              // isTesting: true // REMOVER EM PRODUÇÃO
          });
          bannerRef.current = true;
          console.log('AdMob Banner Initialized');
      } catch (e) {
          console.error('Falha ao carregar AdMob:', e);
      }
  };

  if (!shouldShowAds) return null;

  // Renderização WEB (Placeholder ou AdSense)
  if (!Capacitor.isNativePlatform()) {
      return (
        <div className={`w-full flex justify-center items-center my-4 overflow-hidden ${className}`}>
            <div className={`
                bg-slate-100 border border-slate-200 rounded-lg flex flex-col items-center justify-center
                text-slate-400 text-xs font-medium uppercase tracking-widest relative overflow-hidden
                ${format === 'banner' ? 'w-full h-[90px]' : 'w-[300px] h-[250px]'}
            `}>
                <span className="mb-1 z-10">Publicidade Web</span>
                <div className="text-[10px] text-slate-300 z-10">Google AdSense Area</div>
                
                {/* Visual Pattern Background */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
                    backgroundSize: '10px 10px'
                }}></div>
            </div>
        </div>
      );
  }

  // Renderização MOBILE (O AdMob injeta uma View nativa, então retornamos um espaçador vazio para não quebrar o layout)
  // O BannerAdPosition.BOTTOM_CENTER vai sobrepor o conteúdo na parte inferior
  return <div className="h-[60px] w-full shrink-0" />; 
};
