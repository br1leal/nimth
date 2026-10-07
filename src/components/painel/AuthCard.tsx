import type { FormEvent, ReactNode } from "react";
import { Alert, Card } from "@heroui/react";
import Logo from "@/components/Logo";
import TemaSwitch from "@/components/ui/TemaSwitch";
import CorTema from "@/components/ui/CorTema";

/** Moldura das telas de entrada (entrar, definir senha): cartão central com logo. */
export default function AuthCard({ titulo, texto, children, onSubmit, rodape }: {
  titulo?: string; texto?: string; children?: ReactNode; onSubmit?: (e: FormEvent<HTMLFormElement>) => void; rodape?: ReactNode;
}) {
  return (
    <div className="auth-fundo relative grid min-h-dvh place-items-center px-4 py-10">
      <div className="grid w-full max-w-[420px] gap-5">
        <Card className="gap-6 p-7 md:p-9">
          <Logo className="h-16 w-auto justify-self-center" />
          {(titulo || texto) && (
            <div className="grid gap-1.5 text-center">
              {titulo && <h1 className="font-serif text-[28px] leading-tight">{titulo}</h1>}
              {texto && <p className="text-sm text-muted">{texto}</p>}
            </div>
          )}
          {onSubmit ? <form className="grid gap-4" onSubmit={onSubmit} noValidate>{children}</form> : children}
        </Card>
        {rodape && <div className="text-center text-xs text-muted">{rodape}</div>}
      </div>
      <div className="fixed right-4 bottom-4 flex items-center gap-2"><CorTema /><TemaSwitch /></div>
    </div>
  );
}

/** Mensagem de erro ou sucesso dentro do formulário. */
export function Aviso({ tipo = "danger", children }: { tipo?: "danger" | "success"; children: ReactNode }) {
  return (
    <Alert status={tipo}>
      <Alert.Indicator />
      <Alert.Content><Alert.Description>{children}</Alert.Description></Alert.Content>
    </Alert>
  );
}
