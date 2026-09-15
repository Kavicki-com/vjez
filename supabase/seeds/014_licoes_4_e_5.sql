-- Lições 4 e 5 de cada módulo: fecha a unidade em 5 lições.
--
-- Formato igual ao que o 013 deixou nas outras: 5 exercícios por lição —
-- transformacao 2 (2.5 cada), traducao 2 (1.5 cada), producao_livre 1 (2.0).
-- Soma 10, e a escada fica completa.
--
-- Rodar DEPOIS do 013.
-- PRECISA DE REVISÃO NATIVA antes de publicar: declinação é onde erro de
-- conteúdo custa mais caro.

-- Módulo 1 — Alfabeto e sons ---------------------------------------------------
select public.criar_licao(1, 'Uma letra, um som', 4, '[
  {"tipo":"transformacao","titulo":"Sons que não existem em português","exercicios":[
    {"tipo":"escolher_forma","peso":2.5,
     "enunciado":"Em croata, a letra H:",
     "dica":"Nunca é muda, como o H de hoje.",
     "dados":{"opcoes":["é sempre pronunciada, com som de RR de carro","é muda, como em hoje","soa como um R brando","só soa no fim da palavra"],
              "resposta":"é sempre pronunciada, com som de RR de carro"}},
    {"tipo":"escolher_forma","peso":2.5,
     "enunciado":"A palavra prst (dedo) não tem vogal nenhuma. Quem faz o papel dela?",
     "dica":"Em croata essa letra pode virar o núcleo da sílaba.",
     "dados":{"opcoes":["o R","o P","o S","o T"],"resposta":"o R"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: dedo",
     "dica":"Quatro letras, nenhuma vogal.",
     "dados":{"origem_pt":"dedo","respostas_aceitas":["prst"]}},
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: sangue",
     "dados":{"origem_pt":"sangue","respostas_aceitas":["krv"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva três palavras croatas que tenham H.",
     "dica":"Vale consultar o Dicionário.",
     "dados":{"prompt_pt":"Escreva três palavras croatas que tenham H.","max_caracteres":400}}
  ]}
]'::jsonb);

select public.criar_licao(1, 'Placas e palavras de rua', 5, '[
  {"tipo":"transformacao","titulo":"O que está escrito na porta","exercicios":[
    {"tipo":"ligar_pares","peso":2.5,
     "enunciado":"Ligue cada palavra de placa ao português.",
     "dados":{"pares":[
       {"hr":"ulaz","pt":"entrada"},
       {"hr":"izlaz","pt":"saída"},
       {"hr":"otvoreno","pt":"aberto"},
       {"hr":"zatvoreno","pt":"fechado"}]}},
    {"tipo":"escolher_forma","peso":2.5,
     "enunciado":"A placa diz ZABRANJENO PUŠENJE. O que é proibido ali?",
     "dica":"Pušenje vem de pušiti.",
     "dados":{"opcoes":["fumar","entrar","estacionar","fotografar"],"resposta":"fumar"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: entrada",
     "dados":{"origem_pt":"entrada","respostas_aceitas":["ulaz"]}},
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: aberto",
     "dados":{"origem_pt":"aberto","respostas_aceitas":["otvoreno"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva quatro palavras que você esperaria ver numa placa de loja croata.",
     "dados":{"prompt_pt":"Escreva quatro palavras que você esperaria ver numa placa de loja croata.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 2 — Números -----------------------------------------------------------
select public.criar_licao(2, 'Que horas são?', 4, '[
  {"tipo":"transformacao","titulo":"Perguntar e dizer a hora","exercicios":[
    {"tipo":"escolher_forma","peso":2.5,
     "enunciado":"Como se pergunta que horas são?",
     "dica":"Sati é a forma de hora que vai depois de número.",
     "dados":{"opcoes":["Koliko je sati?","Koliko košta?","Koliko godina?","Kada je?"],"resposta":"Koliko je sati?"}},
    {"tipo":"preencher_lacuna","peso":2.5,
     "enunciado":"Complete: agora são três horas.",
     "dica":"É o verbo biti na terceira pessoa.",
     "dados":{"frase_hr":"Sada ___ tri sata.","base_hr":"biti","resposta":"je"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: que horas são?",
     "dados":{"origem_pt":"que horas são?","respostas_aceitas":["koliko je sati"]}},
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: às cinco horas",
     "dica":"Começa com a preposição u.",
     "dados":{"origem_pt":"às cinco horas","respostas_aceitas":["u pet sati"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva a que horas você acorda e a que horas você almoça, em croata.",
     "dados":{"prompt_pt":"Escreva a que horas você acorda e a que horas você almoça, em croata.","max_caracteres":400}}
  ]}
]'::jsonb);

select public.criar_licao(2, 'Primeiro, segundo, terceiro', 5, '[
  {"tipo":"transformacao","titulo":"Números que viram adjetivo","exercicios":[
    {"tipo":"ligar_pares","peso":2.5,
     "enunciado":"Ligue cada número ordinal ao português.",
     "dados":{"pares":[
       {"hr":"prvi","pt":"primeiro"},
       {"hr":"drugi","pt":"segundo"},
       {"hr":"treći","pt":"terceiro"},
       {"hr":"četvrti","pt":"quarto"}]}},
    {"tipo":"escolher_forma","peso":2.5,"padez":"nominativ",
     "enunciado":"Como se diz a primeira lição? (lekcija é feminino)",
     "dica":"O ordinal concorda com a palavra, como um adjetivo.",
     "dados":{"opcoes":["prva lekcija","prvi lekcija","prvo lekcija","prve lekcija"],"resposta":"prva lekcija"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: o segundo dia",
     "dados":{"origem_pt":"o segundo dia","respostas_aceitas":["drugi dan"]}},
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: primeiro",
     "dados":{"origem_pt":"primeiro","respostas_aceitas":["prvi"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva em croata a ordem das três primeiras coisas que você faz de manhã.",
     "dica":"Use prvi, drugi e treći.",
     "dados":{"prompt_pt":"Escreva em croata a ordem das três primeiras coisas que você faz de manhã.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 3 — Saudações ---------------------------------------------------------
select public.criar_licao(3, 'Como vai?', 4, '[
  {"tipo":"transformacao","titulo":"Perguntar e responder","exercicios":[
    {"tipo":"escolher_forma","peso":2.5,
     "enunciado":"Como se pergunta como vai? para um amigo?",
     "dica":"A forma formal termina em -ste.",
     "dados":{"opcoes":["Kako si?","Kako ste?","Kako se zoveš?","Koliko si?"],"resposta":"Kako si?"}},
    {"tipo":"ligar_pares","peso":2.5,
     "enunciado":"Ligue cada resposta ao português.",
     "dados":{"pares":[
       {"hr":"Dobro sam","pt":"estou bem"},
       {"hr":"Tako-tako","pt":"mais ou menos"},
       {"hr":"Loše","pt":"mal"},
       {"hr":"Odlično","pt":"ótimo"}]}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: estou bem",
     "dados":{"origem_pt":"estou bem","respostas_aceitas":["dobro sam"]}},
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: como vai? (formal)",
     "dados":{"origem_pt":"como vai? (formal)","respostas_aceitas":["kako ste"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Pergunte como alguém está e responda a mesma pergunta, em croata.",
     "dados":{"prompt_pt":"Pergunte como alguém está e responda a mesma pergunta, em croata.","max_caracteres":400}}
  ]}
]'::jsonb);

select public.criar_licao(3, 'Despedidas e desejos', 5, '[
  {"tipo":"transformacao","titulo":"Na hora de ir embora","exercicios":[
    {"tipo":"ligar_pares","peso":2.5,
     "enunciado":"Ligue cada despedida ao português.",
     "dados":{"pares":[
       {"hr":"Vidimo se","pt":"a gente se vê"},
       {"hr":"Sretno","pt":"boa sorte"},
       {"hr":"Živjeli","pt":"saúde, num brinde"},
       {"hr":"Čuvaj se","pt":"se cuida"}]}},
    {"tipo":"escolher_forma","peso":2.5,
     "enunciado":"Você levanta o copo num jantar. O que diz?",
     "dados":{"opcoes":["Živjeli!","Sretno!","Vidimo se!","Čuvaj se!"],"resposta":"Živjeli!"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: a gente se vê",
     "dados":{"origem_pt":"a gente se vê","respostas_aceitas":["vidimo se"]}},
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: boa sorte",
     "dados":{"origem_pt":"boa sorte","respostas_aceitas":["sretno"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Despeça-se de um amigo e deseje boa sorte a ele, em croata.",
     "dados":{"prompt_pt":"Despeça-se de um amigo e deseje boa sorte a ele, em croata.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 4 — Nominativ ---------------------------------------------------------
select public.criar_licao(4, 'O gênero das palavras', 4, '[
  {"tipo":"transformacao","titulo":"O final entrega o gênero","exercicios":[
    {"tipo":"escolher_forma","peso":2.5,"padez":"nominativ",
     "enunciado":"Palavra terminada em -a costuma ser de que gênero?",
     "dica":"Vale para žena, knjiga, kuća.",
     "dados":{"opcoes":["feminino","masculino","neutro","não dá para saber"],"resposta":"feminino"}},
    {"tipo":"ligar_pares","peso":2.5,"padez":"nominativ",
     "enunciado":"Ligue cada palavra ao seu gênero.",
     "dados":{"pares":[
       {"hr":"grad","pt":"masculino, termina em consoante"},
       {"hr":"knjiga","pt":"feminino, termina em -a"},
       {"hr":"more","pt":"neutro, termina em -e"},
       {"hr":"mlijeko","pt":"neutro, termina em -o"}]}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: mar",
     "dados":{"origem_pt":"mar","respostas_aceitas":["more"]}},
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: livro",
     "dados":{"origem_pt":"livro","respostas_aceitas":["knjiga"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva três palavras croatas, uma de cada gênero, e diga qual é qual.",
     "dados":{"prompt_pt":"Escreva três palavras croatas, uma de cada gênero, e diga qual é qual.","max_caracteres":400}}
  ]}
]'::jsonb);

select public.criar_licao(4, 'Mais de um: o plural', 5, '[
  {"tipo":"transformacao","titulo":"Do singular para o plural","exercicios":[
    {"tipo":"escolher_forma","peso":2.5,"padez":"nominativ",
     "enunciado":"O plural de prijatelj (amigo) é:",
     "dica":"Masculino no plural costuma terminar em -i.",
     "dados":{"opcoes":["prijatelji","prijatelja","prijatelje","prijateljima"],"resposta":"prijatelji"}},
    {"tipo":"ligar_pares","peso":2.5,"padez":"nominativ",
     "enunciado":"Ligue cada singular ao seu plural.",
     "dica":"Dijete é irregular: não vira djeteti nem djete, muda de raiz.",
     "dados":{"pares":[
       {"hr":"žena","pt":"žene, mulheres"},
       {"hr":"grad","pt":"gradovi, cidades"},
       {"hr":"knjiga","pt":"knjige, livros"},
       {"hr":"dijete","pt":"djeca, crianças"}]}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"padez":"nominativ",
     "enunciado":"Escreva em croata: mulheres",
     "dados":{"origem_pt":"mulheres","respostas_aceitas":["žene"]}},
    {"tipo":"traducao","peso":1.5,"padez":"nominativ",
     "enunciado":"Escreva em croata: crianças",
     "dados":{"origem_pt":"crianças","respostas_aceitas":["djeca"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva em croata quem são as pessoas da sua casa, no plural.",
     "dados":{"prompt_pt":"Escreva em croata quem são as pessoas da sua casa, no plural.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 5 — Akuzativ ----------------------------------------------------------
select public.criar_licao(5, 'Verbos que pedem Akuzativ', 4, '[
  {"tipo":"transformacao","titulo":"Quem puxa o objeto direto","exercicios":[
    {"tipo":"ligar_pares","peso":2.5,
     "enunciado":"Ligue cada verbo ao português.",
     "dados":{"pares":[
       {"hr":"imam","pt":"eu tenho"},
       {"hr":"volim","pt":"eu amo, eu gosto"},
       {"hr":"gledam","pt":"eu assisto"},
       {"hr":"kupujem","pt":"eu compro"}]}},
    {"tipo":"escolher_forma","peso":2.5,"padez":"akuzativ",
     "enunciado":"Complete: Volim ___ (eu gosto de música).",
     "dica":"Glazba é feminino, e feminino no Akuzativ troca -a por -u.",
     "dados":{"opcoes":["glazbu","glazba","glazbe","glazbom"],"resposta":"glazbu"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"padez":"akuzativ",
     "enunciado":"Escreva em croata: eu compro um livro",
     "dados":{"origem_pt":"eu compro um livro","respostas_aceitas":["kupujem knjigu","ja kupujem knjigu"]}},
    {"tipo":"traducao","peso":1.5,"padez":"akuzativ",
     "enunciado":"Escreva em croata: eu gosto de música",
     "dados":{"origem_pt":"eu gosto de música","respostas_aceitas":["volim glazbu","ja volim glazbu"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva duas coisas de que você gosta e duas que você compra toda semana, em croata.",
     "dados":{"prompt_pt":"Escreva duas coisas de que você gosta e duas que você compra toda semana, em croata.","max_caracteres":400}}
  ]}
]'::jsonb);

select public.criar_licao(5, 'Akuzativ no feminino e no neutro', 5, '[
  {"tipo":"transformacao","titulo":"Nem todo caso muda a palavra","exercicios":[
    {"tipo":"escolher_forma","peso":2.5,"padez":"akuzativ",
     "enunciado":"No Akuzativ, uma palavra neutra como mlijeko fica:",
     "dica":"Neutro se comporta como coisa masculina: não muda.",
     "dados":{"opcoes":["mlijeko, igual ao Nominativ","mlijeka","mlijeku","mlijekom"],"resposta":"mlijeko, igual ao Nominativ"}},
    {"tipo":"preencher_lacuna","peso":2.5,"padez":"akuzativ",
     "enunciado":"Complete: eu assisto televisão.",
     "dica":"Televizija é feminino: troca o -a final por -u.",
     "dados":{"frase_hr":"Gledam ___.","base_hr":"televizija","resposta":"televiziju"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"padez":"akuzativ",
     "enunciado":"Escreva em croata: eu bebo leite",
     "dados":{"origem_pt":"eu bebo leite","respostas_aceitas":["pijem mlijeko","ja pijem mlijeko"]}},
    {"tipo":"traducao","peso":1.5,"padez":"akuzativ",
     "enunciado":"Escreva em croata: eu assisto televisão",
     "dados":{"origem_pt":"eu assisto televisão","respostas_aceitas":["gledam televiziju","ja gledam televiziju"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva o que você come, bebe e assiste num domingo, em croata.",
     "dados":{"prompt_pt":"Escreva o que você come, bebe e assiste num domingo, em croata.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 6 — Genitiv -----------------------------------------------------------
select public.criar_licao(6, 'Muito, pouco, um copo de', 4, '[
  {"tipo":"transformacao","titulo":"Quantidade pede Genitiv","exercicios":[
    {"tipo":"escolher_forma","peso":2.5,"padez":"genitiv",
     "enunciado":"Depois de puno (muito), a palavra seguinte vai em que caso?",
     "dica":"O mesmo caso que vem depois de nema.",
     "dados":{"opcoes":["Genitiv","Nominativ","Akuzativ","Dativ"],"resposta":"Genitiv"}},
    {"tipo":"preencher_lacuna","peso":2.5,"padez":"genitiv",
     "enunciado":"Complete: pouca água.",
     "dica":"Voda é feminino: no Genitiv o -a vira -e.",
     "dados":{"frase_hr":"Malo ___.","base_hr":"voda","resposta":"vode"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"padez":"genitiv",
     "enunciado":"Escreva em croata: muito café",
     "dados":{"origem_pt":"muito café","respostas_aceitas":["puno kave"]}},
    {"tipo":"traducao","peso":1.5,"padez":"genitiv",
     "enunciado":"Escreva em croata: uma garrafa de vinho",
     "dica":"Garrafa é boca.",
     "dados":{"origem_pt":"uma garrafa de vinho","respostas_aceitas":["boca vina"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva o que tem muito e o que tem pouco na sua cozinha, em croata.",
     "dados":{"prompt_pt":"Escreva o que tem muito e o que tem pouco na sua cozinha, em croata.","max_caracteres":400}}
  ]}
]'::jsonb);

select public.criar_licao(6, 'As preposições do Genitiv', 5, '[
  {"tipo":"transformacao","titulo":"iz, od, do, kod","exercicios":[
    {"tipo":"ligar_pares","peso":2.5,"padez":"genitiv",
     "enunciado":"Ligue cada preposição ao seu sentido.",
     "dados":{"pares":[
       {"hr":"iz","pt":"de dentro de, origem"},
       {"hr":"od","pt":"a partir de"},
       {"hr":"do","pt":"até"},
       {"hr":"kod","pt":"na casa de, junto a"}]}},
    {"tipo":"escolher_forma","peso":2.5,"padez":"genitiv",
     "enunciado":"Complete: Idem do ___ (vou até a cidade).",
     "dica":"Todas essas preposições puxam o Genitiv.",
     "dados":{"opcoes":["grada","grad","gradu","gradom"],"resposta":"grada"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"padez":"genitiv",
     "enunciado":"Escreva em croata: até a escola",
     "dados":{"origem_pt":"até a escola","respostas_aceitas":["do škole"]}},
    {"tipo":"traducao","peso":1.5,"padez":"genitiv",
     "enunciado":"Escreva em croata: na casa do amigo",
     "dados":{"origem_pt":"na casa do amigo","respostas_aceitas":["kod prijatelja"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva de onde você vem e até onde você vai hoje, em croata.",
     "dados":{"prompt_pt":"Escreva de onde você vem e até onde você vai hoje, em croata.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 7 — Dativ -------------------------------------------------------------
select public.criar_licao(7, 'Dar, dizer, ajudar', 4, '[
  {"tipo":"transformacao","titulo":"Verbos que pedem Dativ","exercicios":[
    {"tipo":"ligar_pares","peso":2.5,
     "enunciado":"Ligue cada verbo ao português.",
     "dados":{"pares":[
       {"hr":"dati","pt":"dar"},
       {"hr":"reći","pt":"dizer"},
       {"hr":"pomoći","pt":"ajudar"},
       {"hr":"pokazati","pt":"mostrar"}]}},
    {"tipo":"escolher_forma","peso":2.5,"padez":"dativ",
     "enunciado":"Complete: Pomažem ___ (ajudo a mãe).",
     "dica":"Majka no Dativ vira majci: o K amolece e vira C.",
     "dados":{"opcoes":["majci","majka","majku","majkom"],"resposta":"majci"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"padez":"dativ",
     "enunciado":"Escreva em croata: ajudo o amigo",
     "dados":{"origem_pt":"ajudo o amigo","respostas_aceitas":["pomažem prijatelju"]}},
    {"tipo":"traducao","peso":1.5,"padez":"dativ",
     "enunciado":"Escreva em croata: digo para a irmã",
     "dica":"Reći na primeira pessoa é kažem.",
     "dados":{"origem_pt":"digo para a irmã","respostas_aceitas":["kažem sestri"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva para quem você costuma pedir ajuda e o que você diz, em croata.",
     "dados":{"prompt_pt":"Escreva para quem você costuma pedir ajuda e o que você diz, em croata.","max_caracteres":400}}
  ]}
]'::jsonb);

select public.criar_licao(7, 'Como eu me sinto', 5, '[
  {"tipo":"transformacao","titulo":"O Dativ das sensações","exercicios":[
    {"tipo":"ligar_pares","peso":2.5,"padez":"dativ",
     "enunciado":"Ligue cada expressão ao português.",
     "dados":{"pares":[
       {"hr":"Hladno mi je","pt":"estou com frio"},
       {"hr":"Toplo mi je","pt":"estou com calor"},
       {"hr":"Drago mi je","pt":"prazer em conhecer"},
       {"hr":"Žao mi je","pt":"sinto muito"}]}},
    {"tipo":"escolher_forma","peso":2.5,"padez":"dativ",
     "enunciado":"Em Hladno mi je, o que o mi quer dizer?",
     "dica":"A frase é literalmente está frio para mim.",
     "dados":{"opcoes":["para mim, no Dativ","eu, no Nominativ","me, no Akuzativ","comigo, no Instrumental"],
              "resposta":"para mim, no Dativ"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"padez":"dativ",
     "enunciado":"Escreva em croata: prazer em conhecer",
     "dados":{"origem_pt":"prazer em conhecer","respostas_aceitas":["drago mi je"]}},
    {"tipo":"traducao","peso":1.5,"padez":"dativ",
     "enunciado":"Escreva em croata: estou com frio",
     "dados":{"origem_pt":"estou com frio","respostas_aceitas":["hladno mi je"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva como você está se sentindo agora, em croata, usando mi je.",
     "dados":{"prompt_pt":"Escreva como você está se sentindo agora, em croata, usando mi je.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 8 — Lokativ -----------------------------------------------------------
select public.criar_licao(8, 'Falar sobre alguma coisa', 4, '[
  {"tipo":"transformacao","titulo":"A preposição o","exercicios":[
    {"tipo":"escolher_forma","peso":2.5,"padez":"lokativ",
     "enunciado":"Complete: Govorimo o ___ (falamos sobre o filme).",
     "dica":"A preposição o, de sobre, pede o Lokativ.",
     "dados":{"opcoes":["filmu","film","filma","filmom"],"resposta":"filmu"}},
    {"tipo":"preencher_lacuna","peso":2.5,"padez":"lokativ",
     "enunciado":"Complete: penso na minha família.",
     "dica":"Obitelj termina em consoante mas é feminino; no Lokativ ganha -i.",
     "dados":{"frase_hr":"Mislim o ___.","base_hr":"obitelj","resposta":"obitelji"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"padez":"lokativ",
     "enunciado":"Escreva em croata: sobre o livro",
     "dica":"Knjiga no Lokativ vira knjizi: o G amolece e vira Z.",
     "dados":{"origem_pt":"sobre o livro","respostas_aceitas":["o knjizi"]}},
    {"tipo":"traducao","peso":1.5,"padez":"lokativ",
     "enunciado":"Escreva em croata: falamos sobre o filme",
     "dados":{"origem_pt":"falamos sobre o filme","respostas_aceitas":["govorimo o filmu"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva sobre o que você conversa com seus amigos, em croata.",
     "dados":{"prompt_pt":"Escreva sobre o que você conversa com seus amigos, em croata.","max_caracteres":400}}
  ]}
]'::jsonb);

select public.criar_licao(8, 'Onde eu moro', 5, '[
  {"tipo":"transformacao","titulo":"Países e cidades","exercicios":[
    {"tipo":"escolher_forma","peso":2.5,"padez":"lokativ",
     "enunciado":"Complete: Živim u ___ (moro no Brasil).",
     "dica":"Nome de lugar masculino no Lokativ costuma ganhar -u.",
     "dados":{"opcoes":["Brazilu","Brazil","Brazila","Brazilom"],"resposta":"Brazilu"}},
    {"tipo":"ligar_pares","peso":2.5,"padez":"lokativ",
     "enunciado":"Ligue cada lugar à forma usada para dizer onde você está.",
     "dica":"Hrvatska se comporta como adjetivo: vira Hrvatskoj.",
     "dados":{"pares":[
       {"hr":"Hrvatska","pt":"u Hrvatskoj, na Croácia"},
       {"hr":"Zagreb","pt":"u Zagrebu, em Zagreb"},
       {"hr":"Brazil","pt":"u Brazilu, no Brasil"},
       {"hr":"Split","pt":"u Splitu, em Split"}]}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"padez":"lokativ",
     "enunciado":"Escreva em croata: eu moro em Zagreb",
     "dados":{"origem_pt":"eu moro em Zagreb","respostas_aceitas":["živim u zagrebu","ja živim u zagrebu"]}},
    {"tipo":"traducao","peso":1.5,"padez":"lokativ",
     "enunciado":"Escreva em croata: na Croácia",
     "dados":{"origem_pt":"na Croácia","respostas_aceitas":["u hrvatskoj"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva em que país e em que cidade você mora, em croata.",
     "dados":{"prompt_pt":"Escreva em que país e em que cidade você mora, em croata.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 9 — Instrumental ------------------------------------------------------
select public.criar_licao(9, 'Com que ferramenta', 4, '[
  {"tipo":"transformacao","titulo":"O instrumento da ação","exercicios":[
    {"tipo":"escolher_forma","peso":2.5,"padez":"instrumental",
     "enunciado":"Complete: Pišem ___ (escrevo com a caneta).",
     "dica":"Feminino no Instrumental troca o -a final por -om.",
     "dados":{"opcoes":["olovkom","olovka","olovku","olovke"],"resposta":"olovkom"}},
    {"tipo":"preencher_lacuna","peso":2.5,"padez":"instrumental",
     "enunciado":"Complete: como com o garfo.",
     "dica":"Vilica é feminino, como olovka.",
     "dados":{"frase_hr":"Jedem ___.","base_hr":"vilica","resposta":"vilicom"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"padez":"instrumental",
     "enunciado":"Escreva em croata: escrevo com a caneta",
     "dados":{"origem_pt":"escrevo com a caneta","respostas_aceitas":["pišem olovkom"]}},
    {"tipo":"traducao","peso":1.5,"padez":"instrumental",
     "enunciado":"Escreva em croata: com a mão",
     "dados":{"origem_pt":"com a mão","respostas_aceitas":["rukom"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva com que você escreve, com que você come e como você viaja, em croata.",
     "dados":{"prompt_pt":"Escreva com que você escreve, com que você come e como você viaja, em croata.","max_caracteres":400}}
  ]}
]'::jsonb);

select public.criar_licao(9, 'Com os amigos: o plural', 5, '[
  {"tipo":"transformacao","titulo":"Instrumental no plural","exercicios":[
    {"tipo":"escolher_forma","peso":2.5,"padez":"instrumental",
     "enunciado":"Complete: Idem s ___ (vou com os amigos).",
     "dica":"No plural o Instrumental termina em -ima para masculino.",
     "dados":{"opcoes":["prijateljima","prijatelji","prijatelje","prijatelja"],"resposta":"prijateljima"}},
    {"tipo":"ligar_pares","peso":2.5,"padez":"instrumental",
     "enunciado":"Ligue cada grupo à forma de companhia.",
     "dica":"Djeca é coletivo e se comporta como palavra feminina no singular.",
     "dados":{"pares":[
       {"hr":"prijatelji","pt":"s prijateljima, com os amigos"},
       {"hr":"roditelji","pt":"s roditeljima, com os pais"},
       {"hr":"žene","pt":"sa ženama, com as mulheres"},
       {"hr":"djeca","pt":"s djecom, com as crianças"}]}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"padez":"instrumental",
     "enunciado":"Escreva em croata: com os amigos",
     "dados":{"origem_pt":"com os amigos","respostas_aceitas":["s prijateljima","sa prijateljima"]}},
    {"tipo":"traducao","peso":1.5,"padez":"instrumental",
     "enunciado":"Escreva em croata: com os pais",
     "dados":{"origem_pt":"com os pais","respostas_aceitas":["s roditeljima","sa roditeljima"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva com quem você passa os fins de semana, em croata, usando o plural.",
     "dados":{"prompt_pt":"Escreva com quem você passa os fins de semana, em croata, usando o plural.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 10 — Vokativ ----------------------------------------------------------
select public.criar_licao(10, 'O Vokativ dos nomes', 4, '[
  {"tipo":"transformacao","titulo":"Cada nome muda de um jeito","exercicios":[
    {"tipo":"ligar_pares","peso":2.5,"padez":"vokativ",
     "enunciado":"Ligue cada nome à forma usada para chamar a pessoa.",
     "dados":{"pares":[
       {"hr":"Petar","pt":"Petre"},
       {"hr":"Marija","pt":"Marijo"},
       {"hr":"Marko","pt":"Marko, não muda"},
       {"hr":"Tomislav","pt":"Tomislave"}]}},
    {"tipo":"escolher_forma","peso":2.5,"padez":"vokativ",
     "enunciado":"Nome masculino terminado em -o, como Marko, no Vokativ:",
     "dica":"Compare com Ivan, que vira Ivane.",
     "dados":{"opcoes":["não muda","ganha -e","ganha -u","perde o -o"],"resposta":"não muda"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"padez":"vokativ",
     "enunciado":"Escreva em croata: oi, Petar! (chamando ele)",
     "dados":{"origem_pt":"oi, Petar! (chamando ele)","respostas_aceitas":["bok petre","bok, petre"]}},
    {"tipo":"traducao","peso":1.5,"padez":"vokativ",
     "enunciado":"Escreva em croata: Maria! (chamando ela)",
     "dados":{"origem_pt":"Maria! (chamando ela)","respostas_aceitas":["marijo"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva o começo de uma mensagem para um amigo croata, chamando ele pelo nome.",
     "dados":{"prompt_pt":"Escreva o começo de uma mensagem para um amigo croata, chamando ele pelo nome.","max_caracteres":400}}
  ]}
]'::jsonb);

select public.criar_licao(10, 'Vokativ em mensagens', 5, '[
  {"tipo":"transformacao","titulo":"Abrindo e fechando um texto","exercicios":[
    {"tipo":"ligar_pares","peso":2.5,"padez":"vokativ",
     "enunciado":"Ligue cada abertura ao seu uso.",
     "dados":{"pares":[
       {"hr":"Dragi Ivane","pt":"Querido Ivan, para um homem"},
       {"hr":"Draga Marijo","pt":"Querida Maria, para uma mulher"},
       {"hr":"Poštovani","pt":"Prezado, formal"},
       {"hr":"Pozdrav","pt":"Um abraço, no fim da mensagem"}]}},
    {"tipo":"escolher_forma","peso":2.5,"padez":"vokativ",
     "enunciado":"Para começar um e-mail formal em croata, você escreve:",
     "dica":"É a forma que não usa o nome da pessoa.",
     "dados":{"opcoes":["Poštovani,","Bok,","Dragi,","Živjeli,"],"resposta":"Poštovani,"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"padez":"vokativ",
     "enunciado":"Escreva em croata: Querido Ivan",
     "dados":{"origem_pt":"Querido Ivan","respostas_aceitas":["dragi ivane"]}},
    {"tipo":"traducao","peso":1.5,
     "enunciado":"Escreva em croata: um abraço (no fim de uma mensagem)",
     "dados":{"origem_pt":"um abraço (no fim de uma mensagem)","respostas_aceitas":["pozdrav"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva as duas primeiras linhas de um e-mail formal em croata.",
     "dados":{"prompt_pt":"Escreva as duas primeiras linhas de um e-mail formal em croata.","max_caracteres":400}}
  ]}
]'::jsonb);
