import { IaBookExperienceCard } from "@/components/lessons/IaBookExperienceCard";

export default function TestCard() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Prévia do Card de Experiência IA
          </h1>
          <p className="text-muted-foreground">
            Este é o card visual animado que aparecerá dentro da aula quando
            integrado ao GuidedLessonV4.
          </p>
        </div>

        <div className="bg-card/50 rounded-xl p-6 border border-border">
          <IaBookExperienceCard />
        </div>

        <div className="mt-8 text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Como funciona:</strong> Este card será renderizado dentro de
            uma seção específica da aula V4, após o markdown normal.
          </p>
          <p>
            <strong>Animações:</strong> O card entra com fade + slide-up, e os
            elementos internos (capa do livro e capítulos) surgem em sequência.
          </p>
          <p>
            <strong>Integração:</strong> Será adicionado um condicional no
            GuidedLessonV4 para renderizar este card quando lessonId e
            sectionIndex corresponderem à aula escolhida.
          </p>
        </div>
      </div>
    </div>
  );
}
