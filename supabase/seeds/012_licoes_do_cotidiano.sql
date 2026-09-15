-- Lição 3 de cada módulo: o cotidiano (corpo, compras, restaurante, viagem).
-- Origem: lista de 30 exercícios trazida pelo dono, reencaixada na espinha do
-- currículo (003) e corrigida. O que mudou em relação à lista original está
-- anotado exercício a exercício com "-- correção:".
--
-- Cada chamada de criar_licao() recusa a lição se os pesos não somarem 10
-- ou se faltar alguma das 3 atividades da escada.
-- PRECISA DE REVISÃO NATIVA antes de publicar.

-- Módulo 1 — Alfabeto e sons ---------------------------------------------------
-- correção: a lista testava Č/Ć juntos e Đ/Dž juntos. São sons diferentes e as
-- lições 1 e 2 já os separam; aqui o tema passa a ser a vogal, que é onde o
-- brasileiro erra de verdade (nasaliza o final e troca o O final por U).
select public.criar_licao(1, 'As vogais e o sotaque brasileiro', 3, '[
  {"tipo":"transformacao","titulo":"Vogal croata é vogal pura","exercicios":[
    {"tipo":"escolher_forma","peso":1.5,
     "enunciado":"A palavra auto (carro) termina com que som?",
     "dica":"Em croata a vogal final nunca muda de som nem enfraquece.",
     "dados":{"opcoes":["o fechado, como em avô","u, como em carro falado no Brasil","ão, como em não","ô nasal"],
              "resposta":"o fechado, como em avô"}},
    {"tipo":"escolher_forma","peso":1.5,
     "enunciado":"Como se pronuncia o final de dan (dia)?",
     "dica":"O croata não tem vogal nasal: o N é sempre uma consoante inteira.",
     "dados":{"opcoes":["com o N marcado, como em dane","nasal, como em lã","com som de M","o N não se pronuncia"],
              "resposta":"com o N marcado, como em dane"}},
    {"tipo":"ligar_pares","peso":2,
     "enunciado":"Ligue cada vogal croata ao som que ela tem em português.",
     "dados":{"pares":[
       {"hr":"a","pt":"a aberto, como em pá"},
       {"hr":"e","pt":"e fechado, como em mesa"},
       {"hr":"o","pt":"ô fechado, como em avô"},
       {"hr":"u","pt":"u, como em luz"}]}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva o nome da capital da Croácia, em croata.",
     "dica":"Começa com Z, e o G é sempre duro, como em gato.",
     "dados":{"origem_pt":"a capital da Croácia","respostas_aceitas":["Zagreb"]}},
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: dia",
     "dados":{"origem_pt":"dia","respostas_aceitas":["dan"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva uma palavra croata para cada vogal: a, e, i, o, u.",
     "dica":"Vale consultar o Dicionário.",
     "dados":{"prompt_pt":"Escreva uma palavra croata para cada vogal: a, e, i, o, u.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 2 — Números -----------------------------------------------------------
-- correção: a lista repetia a contagem de 1 a 5, que já está na lição 1. Aqui os
-- números aparecem em uso, e entra a regra que a lista usava sem explicar:
-- godina muda de forma depois do número.
select public.criar_licao(2, 'Idade, preço e quantidade', 3, '[
  {"tipo":"transformacao","titulo":"Número muda a palavra seguinte","exercicios":[
    {"tipo":"escolher_forma","peso":1.5,"padez":"genitiv",
     "enunciado":"Qual forma de godina (ano) vem depois de um número a partir de 5?",
     "dica":"De 2 a 4 é godine; de 5 em diante volta para godina.",
     "dados":{"opcoes":["godina","godine","godinu","godinama"],"resposta":"godina"}},
    {"tipo":"preencher_lacuna","peso":1.5,"padez":"genitiv",
     "enunciado":"Complete: ela tem dois anos.",
     "dica":"De 2 a 4 a palavra muda para godine.",
     "dados":{"frase_hr":"Ona ima dvije ___.","base_hr":"godina","resposta":"godine"}},
    {"tipo":"montar_frase","peso":2,
     "enunciado":"Monte a pergunta: Quanto custa isso?",
     "dados":{"alvo_hr":"Koliko to košta","tokens":["košta","Koliko","to"]}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: eu tenho trinta anos",
     "dica":"Trinta é trideset.",
     "dados":{"origem_pt":"eu tenho trinta anos","respostas_aceitas":["imam trideset godina","ja imam trideset godina"]}},
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: quanto custa?",
     "dados":{"origem_pt":"quanto custa?","respostas_aceitas":["koliko košta","koliko to košta"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Você está numa loja. Pergunte o preço de duas coisas diferentes, em croata.",
     "dados":{"prompt_pt":"Você está numa loja. Pergunte o preço de duas coisas diferentes, em croata.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 3 — Saudações ---------------------------------------------------------
-- correção: a lista glosava Dobar dan como boa tarde. É o cumprimento do dia
-- inteiro. Bok, Hvala, Doviđenja e Laku noć já estão nas lições 1 e 2; aqui
-- entram os que faltavam (Dobar dan, Dobra večer, Oprostite, Molim vas).
select public.criar_licao(3, 'Formal ou informal', 3, '[
  {"tipo":"transformacao","titulo":"O tom certo para cada pessoa","exercicios":[
    {"tipo":"ligar_pares","peso":2,
     "enunciado":"Ligue cada expressão ao momento ou ao tom em que ela se usa.",
     "dados":{"pares":[
       {"hr":"Dobar dan","pt":"bom dia ou boa tarde, o cumprimento do dia inteiro"},
       {"hr":"Dobra večer","pt":"boa noite, ao chegar"},
       {"hr":"Oprostite","pt":"com licença, desculpe"},
       {"hr":"Molim vas","pt":"por favor, formal"}]}},
    {"tipo":"escolher_forma","peso":1.5,
     "enunciado":"Você chega num restaurante às 20h. O que diz?",
     "dica":"Laku noć é só na despedida, quando alguém vai dormir.",
     "dados":{"opcoes":["Dobra večer!","Laku noć!","Dobro jutro!","Doviđenja!"],"resposta":"Dobra večer!"}},
    {"tipo":"montar_frase","peso":1.5,
     "enunciado":"Monte a frase: Eu sou turista.",
     "dica":"Homem diz turist; mulher diz turistkinja.",
     "dados":{"alvo_hr":"Ja sam turist","tokens":["sam","Ja","turist"]}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: com licença",
     "dados":{"origem_pt":"com licença","respostas_aceitas":["oprostite"]}},
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: eu não falo croata",
     "dica":"Falar é govoriti; na primeira pessoa fica govorim.",
     "dados":{"origem_pt":"eu não falo croata","respostas_aceitas":["ne govorim hrvatski","ja ne govorim hrvatski"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Você chega num restaurante à noite. Cumprimente, diga que é turista e que não fala croata.",
     "dados":{"prompt_pt":"Você chega num restaurante à noite. Cumprimente, diga que é turista e que não fala croata.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 4 — Nominativ ---------------------------------------------------------
-- correção: a lista misturava gente (Nominativ) com bebo café e como almoço,
-- que são Akuzativ. Os dois últimos foram para o módulo 5, onde o caso é
-- ensinado. Brat e sestra já estão na lição 1 deste módulo.
select public.criar_licao(4, 'Gente: amigos e conhecidos', 3, '[
  {"tipo":"transformacao","titulo":"Quem é quem","exercicios":[
    {"tipo":"ligar_pares","peso":2,
     "enunciado":"Ligue cada palavra ao português.",
     "dados":{"pares":[
       {"hr":"prijatelj","pt":"amigo"},
       {"hr":"muškarac","pt":"homem"},
       {"hr":"žena","pt":"mulher, e também esposa"},
       {"hr":"dijete","pt":"criança"}]}},
    {"tipo":"montar_frase","peso":1.5,"padez":"nominativ",
     "enunciado":"Monte a frase: O amigo está aqui.",
     "dados":{"alvo_hr":"Prijatelj je ovdje","tokens":["je","Prijatelj","ovdje"]}},
    {"tipo":"escolher_forma","peso":1.5,"padez":"nominativ",
     "enunciado":"Na frase Muškarac pije kavu, quem faz a ação?",
     "dica":"Quem faz a ação vem no Nominativ, a forma de dicionário.",
     "dados":{"opcoes":["muškarac","kavu","pije","kava"],"resposta":"muškarac"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"padez":"nominativ",
     "enunciado":"Escreva em croata: ela é minha amiga",
     "dica":"A forma feminina de prijatelj é prijateljica.",
     "dados":{"origem_pt":"ela é minha amiga","respostas_aceitas":["ona je moja prijateljica"]}},
    {"tipo":"traducao","peso":1.5,"padez":"nominativ",
     "enunciado":"Escreva em croata: nós somos amigos",
     "dica":"No plural, prijatelj vira prijatelji.",
     "dados":{"origem_pt":"nós somos amigos","respostas_aceitas":["mi smo prijatelji","smo prijatelji"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva o nome de dois amigos seus e diga que eles são seus amigos, em croata.",
     "dados":{"prompt_pt":"Escreva o nome de dois amigos seus e diga que eles são seus amigos, em croata.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 5 — Akuzativ ----------------------------------------------------------
-- correção: a lista punha dućan como distrator errado em Idem u supermarket,
-- mas Idem u dućan é croata correto. O distrator saiu. O par pessoa/coisa
-- (prijatelja vs kruh) é o que a lista tinha de melhor e vira o miolo da lição.
select public.criar_licao(5, 'No supermercado', 3, '[
  {"tipo":"transformacao","titulo":"Pessoa muda, coisa não","exercicios":[
    {"tipo":"escolher_forma","peso":1.5,"padez":"akuzativ",
     "enunciado":"Complete: Vidim ___ (eu vejo o amigo).",
     "dica":"Quando o objeto é uma pessoa, o Akuzativ masculino copia o Genitiv.",
     "dados":{"opcoes":["prijatelja","prijatelj","prijatelju","prijateljem"],"resposta":"prijatelja"}},
    {"tipo":"escolher_forma","peso":1.5,"padez":"akuzativ",
     "enunciado":"E agora: Vidim ___ (eu vejo o pão).",
     "dica":"Coisa não muda no Akuzativ masculino; só pessoa e bicho mudam.",
     "dados":{"opcoes":["kruh","kruha","kruhu","kruhom"],"resposta":"kruh"}},
    {"tipo":"ligar_pares","peso":2,
     "enunciado":"Ligue cada palavra do mercado ao português.",
     "dados":{"pares":[
       {"hr":"mlijeko","pt":"leite"},
       {"hr":"jabuka","pt":"maçã"},
       {"hr":"sir","pt":"queijo"},
       {"hr":"ručak","pt":"almoço"}]}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"padez":"akuzativ",
     "enunciado":"Escreva em croata: nós comemos o almoço",
     "dados":{"origem_pt":"nós comemos o almoço","respostas_aceitas":["mi jedemo ručak","jedemo ručak"]}},
    {"tipo":"traducao","peso":1.5,"padez":"akuzativ",
     "enunciado":"Escreva em croata: nós temos um carro",
     "dica":"Auto não muda de forma no Akuzativ.",
     "dados":{"origem_pt":"nós temos um carro","respostas_aceitas":["imamo auto","mi imamo auto"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva o que você vai comprar no mercado, em croata, com pelo menos três itens.",
     "dica":"Mercado pode ser supermarket ou dućan; as duas formas servem.",
     "dados":{"prompt_pt":"Escreva o que você vai comprar no mercado, em croata, com pelo menos três itens.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 6 — Genitiv -----------------------------------------------------------
-- O restaurante da lista entra aqui porque pedir sem carne e sem açúcar é
-- Genitiv puro; chamar o garçom ficou para o módulo 10, que é o Vokativ.
select public.criar_licao(6, 'No restaurante: pedir e pagar', 3, '[
  {"tipo":"transformacao","titulo":"O que se pede na mesa","exercicios":[
    {"tipo":"ligar_pares","peso":2,
     "enunciado":"Ligue cada palavra do restaurante ao português.",
     "dados":{"pares":[
       {"hr":"jelovnik","pt":"cardápio"},
       {"hr":"konobar","pt":"garçom"},
       {"hr":"juha","pt":"sopa"},
       {"hr":"račun","pt":"a conta"}]}},
    {"tipo":"preencher_lacuna","peso":1.5,"padez":"genitiv",
     "enunciado":"Complete: uma sopa sem carne.",
     "dica":"A preposição bez sempre puxa o Genitiv.",
     "dados":{"frase_hr":"Juha bez ___.","base_hr":"meso","resposta":"mesa"}},
    {"tipo":"montar_frase","peso":1.5,"padez":"akuzativ",
     "enunciado":"Monte a frase: Eu quero pagar a conta.",
     "dados":{"alvo_hr":"Želim platiti račun","tokens":["platiti","Želim","račun"]}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: o cardápio, por favor",
     "dados":{"origem_pt":"o cardápio, por favor","respostas_aceitas":["jelovnik molim","jelovnik molim vas","jelovnik, molim vas"]}},
    {"tipo":"traducao","peso":1.5,"padez":"genitiv",
     "enunciado":"Escreva em croata: uma sopa sem carne",
     "dados":{"origem_pt":"uma sopa sem carne","respostas_aceitas":["juha bez mesa"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Você está num restaurante. Peça o cardápio e pergunte se tem sopa sem carne.",
     "dados":{"prompt_pt":"Você está num restaurante. Peça o cardápio e pergunte se tem sopa sem carne.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 7 — Dativ -------------------------------------------------------------
-- correção: a lista aceitava Moram ići doktoru, sem preposição. O padrão é
-- k doktoru (Dativ) ou kod doktora (Genitiv). Agora o exercício ensina isso
-- em vez de tropeçar nele — e o Dativ chega no módulo onde é ensinado.
select public.criar_licao(7, 'Saúde: indo ao médico', 3, '[
  {"tipo":"transformacao","titulo":"Onde dói","exercicios":[
    {"tipo":"ligar_pares","peso":2,
     "enunciado":"Ligue cada parte do corpo ao português.",
     "dados":{"pares":[
       {"hr":"glava","pt":"cabeça"},
       {"hr":"ruka","pt":"mão, e também braço"},
       {"hr":"noga","pt":"perna, e também pé"},
       {"hr":"oko","pt":"olho"}]}},
    {"tipo":"montar_frase","peso":1.5,
     "enunciado":"Monte a frase: Minha cabeça dói.",
     "dica":"Em croata a frase é literalmente dói-me a cabeça.",
     "dados":{"alvo_hr":"Boli me glava","tokens":["me","Boli","glava"]}},
    {"tipo":"escolher_forma","peso":1.5,"padez":"dativ",
     "enunciado":"Complete: Moram ići ___ (preciso ir ao médico).",
     "dica":"A preposição k pede o Dativ. Kod doktora também serve, mas é Genitiv.",
     "dados":{"opcoes":["k doktoru","k doktor","doktora","s doktorom"],"resposta":"k doktoru"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"padez":"dativ",
     "enunciado":"Escreva em croata: preciso ir ao médico",
     "dados":{"origem_pt":"preciso ir ao médico","respostas_aceitas":["moram ići k doktoru","moram ići kod doktora","moram ići liječniku"]}},
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: meu olho dói",
     "dica":"Mesma construção de Boli me glava.",
     "dados":{"origem_pt":"meu olho dói","respostas_aceitas":["boli me oko"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Você está na farmácia. Diga o que está doendo e que precisa ir ao médico.",
     "dados":{"prompt_pt":"Você está na farmácia. Diga o que está doendo e que precisa ir ao médico.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 8 — Lokativ -----------------------------------------------------------
-- correção: a lista usava Šetat ću po parku, futuro, quatro unidades antes de
-- ensinar futuro. Virou Šetam po parku, presente. O futuro ficou no módulo 9.
select public.criar_licao(8, 'Na cidade: hotel, rua e parque', 3, '[
  {"tipo":"transformacao","titulo":"Onde você está","exercicios":[
    {"tipo":"ligar_pares","peso":2,
     "enunciado":"Ligue cada lugar da cidade ao português.",
     "dados":{"pares":[
       {"hr":"restoran","pt":"restaurante"},
       {"hr":"ulica","pt":"rua"},
       {"hr":"park","pt":"parque"},
       {"hr":"trg","pt":"praça"}]}},
    {"tipo":"escolher_forma","peso":1.5,"padez":"lokativ",
     "enunciado":"Complete: Ja sam u ___ (estou no hotel).",
     "dica":"Lugar parado com u pede o Lokativ.",
     "dados":{"opcoes":["hotelu","hotel","hotela","hotelom"],"resposta":"hotelu"}},
    {"tipo":"preencher_lacuna","peso":1.5,"padez":"lokativ",
     "enunciado":"Complete: eu passeio pelo parque.",
     "dica":"A preposição po também pede o Lokativ.",
     "dados":{"frase_hr":"Šetam po ___.","base_hr":"park","resposta":"parku"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"padez":"lokativ",
     "enunciado":"Escreva em croata: no restaurante",
     "dados":{"origem_pt":"no restaurante","respostas_aceitas":["u restoranu"]}},
    {"tipo":"traducao","peso":1.5,"padez":"lokativ",
     "enunciado":"Escreva em croata: eu estou no hotel",
     "dados":{"origem_pt":"eu estou no hotel","respostas_aceitas":["ja sam u hotelu","sam u hotelu"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Você está numa cidade croata. Escreva em que hotel você está e por onde costuma passear.",
     "dados":{"prompt_pt":"Você está numa cidade croata. Escreva em que hotel você está e por onde costuma passear.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 9 — Instrumental ------------------------------------------------------
-- correção: a lista só dava a forma masculina do passado (čitao) e o exercício
-- de montar frase aceitava uma sequência só, reprovando aluna que escrevesse
-- čitala. Agora a diferença é o que a lição ensina.
select public.criar_licao(9, 'Contando a viagem', 3, '[
  {"tipo":"transformacao","titulo":"Ontem e amanhã","exercicios":[
    {"tipo":"escolher_forma","peso":1.5,
     "enunciado":"No passado o croata junta o verbo biti com o particípio. Qual está certo para uma mulher?",
     "dica":"Homem diz čitao; mulher diz čitala.",
     "dados":{"opcoes":["Jučer sam čitala knjigu","Jučer sam čitao knjigu","Jučer sam čitati knjigu","Jučer sam čita knjigu"],
              "resposta":"Jučer sam čitala knjigu"}},
    {"tipo":"montar_frase","peso":1.5,"padez":"akuzativ",
     "enunciado":"Monte a frase, falando como um homem: Ontem eu li um livro.",
     "dados":{"alvo_hr":"Jučer sam čitao knjigu","tokens":["sam","knjigu","Jučer","čitao"]}},
    {"tipo":"montar_frase","peso":2,"padez":"instrumental",
     "enunciado":"Monte a frase: Amanhã eu vou viajar de trem.",
     "dica":"O meio de transporte vai no Instrumental, sem preposição nenhuma.",
     "dados":{"alvo_hr":"Sutra ću putovati vlakom","tokens":["ću","vlakom","Sutra","putovati"]}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: amanhã eu vou viajar",
     "dica":"Amanhã é sutra.",
     "dados":{"origem_pt":"amanhã eu vou viajar","respostas_aceitas":["sutra ću putovati","ja ću sutra putovati"]}},
    {"tipo":"traducao","peso":1.5,"padez":"akuzativ",
     "enunciado":"Escreva em croata, falando como uma mulher: ontem eu bebi café",
     "dica":"O particípio feminino de piti é pila.",
     "dados":{"origem_pt":"ontem eu bebi café","respostas_aceitas":["jučer sam pila kavu"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Conte um dia de turismo em croata: diga que acordou, tomou café e passeou pela cidade.",
     "dica":"Use o passado, e lembre de escolher o particípio do seu gênero.",
     "dados":{"prompt_pt":"Conte um dia de turismo em croata: diga que acordou, tomou café e passeou pela cidade.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 10 — Vokativ ----------------------------------------------------------
-- Aqui fecha o restaurante da lista: chamar o garçom é Vokativ. Gospodine e
-- gospođo entram no lugar de konobaru porque são as formas que o turista usa
-- de verdade, e servem para qualquer desconhecido, não só no restaurante.
select public.criar_licao(10, 'Chamando quem você não conhece', 3, '[
  {"tipo":"transformacao","titulo":"Senhor e senhora","exercicios":[
    {"tipo":"escolher_forma","peso":1.5,"padez":"vokativ",
     "enunciado":"Você quer chamar um homem que não conhece. Como se dirige a ele?",
     "dica":"Gospodin no Vokativ perde o N final e ganha E.",
     "dados":{"opcoes":["Gospodine!","Gospodin!","Gospodina!","Gospodinu!"],"resposta":"Gospodine!"}},
    {"tipo":"escolher_forma","peso":1.5,"padez":"vokativ",
     "enunciado":"E para chamar uma mulher que você não conhece?",
     "dica":"Palavra feminina terminada em A troca o A por O no Vokativ.",
     "dados":{"opcoes":["Gospođo!","Gospođa!","Gospođu!","Gospođi!"],"resposta":"Gospođo!"}},
    {"tipo":"preencher_lacuna","peso":2,"padez":"vokativ",
     "enunciado":"Complete: com licença, senhor.",
     "dados":{"frase_hr":"Oprostite, ___!","base_hr":"gospodin","resposta":"gospodine"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"padez":"vokativ",
     "enunciado":"Escreva em croata: obrigado, senhor",
     "dados":{"origem_pt":"obrigado, senhor","respostas_aceitas":["hvala gospodine","hvala, gospodine"]}},
    {"tipo":"traducao","peso":1.5,"padez":"vokativ",
     "enunciado":"Escreva em croata: com licença, senhora",
     "dados":{"origem_pt":"com licença, senhora","respostas_aceitas":["oprostite gospođo","oprostite, gospođo"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Você quer chamar a atenção do garçom num restaurante. Escreva o que diria, tratando a pessoa com respeito.",
     "dados":{"prompt_pt":"Você quer chamar a atenção do garçom num restaurante. Escreva o que diria, tratando a pessoa com respeito.","max_caracteres":400}}
  ]}
]'::jsonb);
