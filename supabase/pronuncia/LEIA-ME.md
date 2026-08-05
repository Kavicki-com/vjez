# Pronúncia em português

`lex_items.pronuncia_pt`, `frases.pronuncia_pt` e `numeros.pronuncia_pt`
guardam um **respelling silábico** com a sílaba tônica em MAIÚSCULA:

| croata | pronúncia |
|---|---|
| voda | VÓ-da |
| kuća | KU-tcha |
| žena | JÉ-na |
| knjiga | KNHI-ga |
| prijatelj | PRI-ia-télh |

Não é AFI de propósito: o público é iniciante, e AFI exigiria aprender um
segundo alfabeto antes de aprender o primeiro.

## Como foi gerado

`transcrever.py`. O croata é fonético — cada letra tem um som só — então a
parte segmental é mecânica:

| croata | vira | por quê |
|---|---|---|
| č, ć | tch | ć é mais suave, mas não há par no português |
| š | ch | |
| ž | j | |
| c | ts | nunca é "k" nem "s" |
| dž, đ | dj | |
| lj | lh | |
| nj | nh | |
| h | r | aspirado; o mais perto é o "rr" leve |
| j | i | semivogal, como o "i" de "pai" |
| s entre vogais | ss | senão o português leria "z" |
| e, o | é, ó | as vogais croatas são sempre abertas |

Regerar: `python3 supabase/pronuncia/transcrever.py voda kuća` mostra o
resultado de palavras avulsas.

## O que precisa de revisão nativa

**A tônica.** O croata nunca acentua a última sílaba de palavra polissílaba,
e o padrão majoritário é a primeira — foi essa a regra aplicada. Mas a
tônica é lexical, e empréstimos fogem do padrão: `čokolada` saiu
`TCHÓ-kó-la-da` e pode estar errada.

**Ditongos.** `autobus` saiu `A-u-tó-bus`, separando o "au" que na prática é
um ditongo.

**Clíticos.** Em frases, cada palavra recebe tônica própria — `Kako se
zoveš?` virou `KA-kó SÉ ZÓ-véch`, mas o "se" é átono.

Nenhum desses erra o SOM das letras, só o ritmo. Corrigir é editar o campo
direto; o app lê o que estiver lá.
