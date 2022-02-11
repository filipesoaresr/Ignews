import { SignInButton } from '../SignInButton';
import styles from './styles.module.scss';
import  Link  from 'next/link';
import { ActiveLink } from '../ActiveLink';

// O link âncora exige que a página seja carregada do total zero
// Prefetch ---> Deixa a página pré carregada ----> 
// Next.js auto-prefetches automatically based on viewport.The prefetch attribute is no longer needed.

export function Header() {
    return (
        <header className={styles.headerContainer}>
            <div className={styles.headerContent}>
                <img src="/images/logo.svg" alt="Ignews" />
                
                <nav>
                    <ActiveLink activeClassName={styles.active} href="/">
                        <a>Home</a>
                    </ActiveLink>

                    <ActiveLink activeClassName={styles.active} href="/posts">
                        <a>Posts</a>
                    </ActiveLink>
                </nav>

                <SignInButton />
            </div>
        </header>
    );
}