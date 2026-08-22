-- Uma célula da grade pode ter DUAS formas, não uma.
--
-- Sete terminações do padrão regular são alternantes: o acusativo masculino
-- muda conforme o substantivo é ser vivo ou coisa (grad / prijatelja), e o
-- neutro tem tema duro e tema mole (selo / polje). Guardar isso como a
-- string "grad / prijatelja" servia para ler, mas não para falar: o TTS
-- leria a barra, e o aluno não teria como ouvir uma forma sem a outra.
--
-- Vira array, então, com a segunda palavra-modelo (prijatelj, polje) nas
-- células que a terminação já anunciava como alternante.

alter table public.padez_terminacoes add column exemplos_hr text[];

update public.padez_terminacoes
  set exemplos_hr = string_to_array(exemplo_hr, ' / ');

alter table public.padez_terminacoes
  alter column exemplos_hr set not null,
  add constraint padez_terminacoes_exemplos_nao_vazio
    check (cardinality(exemplos_hr) between 1 and 2),
  drop column exemplo_hr;
