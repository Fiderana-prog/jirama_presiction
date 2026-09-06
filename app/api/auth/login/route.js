import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!supabase) {
      const urlMissing = !(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
      const keyMissing = !(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY);
      return NextResponse.json({ error: `Supabase n'est pas configuré. URL manquant: ${urlMissing}, Clé manquante: ${keyMissing}. Veuillez vérifier vos variables d'environnement.` }, { status: 500 });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ message: 'Connexion réussie', data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
