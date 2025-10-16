import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { createUser } from '../services/userService';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 세션 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('🔄 Auth state changed:', _event);

        // 로그인 성공 시 Backend에 사용자 자동 생성
        if (_event === 'SIGNED_IN' && session?.user) {
          try {
            await createUser({
              email: session.user.email!,
              display_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
              avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
            });
            console.log('✅ Backend 사용자 생성 완료 또는 이미 존재함');
          } catch (error: any) {
            // 이미 존재하는 사용자는 무시 (409 Conflict)
            if (error.response?.status !== 409) {
              console.error('❌ Backend 사용자 생성 실패:', error);
            }
          }
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Deep Link 처리 (소셜 로그인 콜백)
    const handleDeepLink = async (url: string) => {
      if (url.includes('#access_token=') || url.includes('?access_token=')) {
        console.log('🔗 Deep link received:', url);

        // URL에서 토큰 추출
        const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          // Supabase에 세션 설정
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            console.error('❌ 세션 설정 실패:', error.message);
          } else {
            console.log('✅ 세션 설정 성공:', data.user?.email);
          }
        }
      }
    };

    // Deep Link 리스너 등록
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // 앱이 닫힌 상태에서 링크로 열린 경우
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    return () => {
      subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
