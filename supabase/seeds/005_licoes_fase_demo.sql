-- Lições da fase demo (módulos 1 a 3), duas por módulo.
-- Cada chamada de criar_licao() recusa a lição se os pesos não somarem 10
-- ou se faltar alguma das 3 atividades da escada.
-- PRECISA DE REVISÃO NATIVA antes de publicar.

-- Módulo 1, lição 2 -----------------------------------------------------------
select public.criar_licao(1, 'Ler e pronunciar', 2, '[
  {"tipo":"transformacao","titulo":"Sons que enganam","exercicios":[
    {"tipo":"escolher_forma","peso":1.5,
     "enunciado":"Qual palavra tem o som de \"nh\", como em \"banho\"?",
     "dica":"Procure o par de letras NJ.",
     "dados":{"opcoes":["kruh","konj","kava","kuća"],"resposta":"konj"}},
    {"tipo":"escolher_forma","peso":1.5,
     "enunciado":"Em croata, a letra J soa como:",
     "dica":"Não é o J do português.",
     "dados":{"opcoes":["j de janela","i de pai","g de gato","é muda"],"resposta":"i de pai"}},
    {"tipo":"ligar_pares","peso":2,
     "enunciado":"Ligue cada dupla de letras ao seu som.",
     "dados":{"pares":[
       {"hr":"Lj","pt":"lh, como em filho"},
       {"hr":"Nj","pt":"nh, como em banho"},
       {"hr":"Dž","pt":"dj duro, como jeans em inglês"},
       {"hr":"Đ","pt":"dj suave, como di carioca"}]}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"enunciado":"Escreva em croata: obrigado",
     "dados":{"origem_pt":"obrigado","respostas_aceitas":["hvala"]}},
    {"tipo":"traducao","peso":1.5,"enunciado":"Escreva em croata: bom dia (de manhã cedo)",
     "dica":"São duas palavras.",
     "dados":{"origem_pt":"bom dia (de manhã cedo)","respostas_aceitas":["dobro jutro"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva três palavras em croata que tenham Č, Š ou Ž.",
     "dica":"Vale consultar o Dicionário.",
     "dados":{"prompt_pt":"Escreva três palavras em croata que tenham Č, Š ou Ž.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 2 --------------------------------------------------------------------
select public.criar_licao(2, 'De zero a dez', 1, '[
  {"tipo":"transformacao","titulo":"Os primeiros números","exercicios":[
    {"tipo":"ligar_pares","peso":2,
     "enunciado":"Ligue cada número ao nome em croata.",
     "dados":{"pares":[
       {"hr":"jedan","pt":"1"},{"hr":"tri","pt":"3"},
       {"hr":"pet","pt":"5"},{"hr":"sedam","pt":"7"}]}},
    {"tipo":"escolher_forma","peso":1.5,
     "enunciado":"Como se diz 4 em croata?",
     "dados":{"opcoes":["tri","četiri","pet","šest"],"resposta":"četiri"}},
    {"tipo":"escolher_forma","peso":1.5,
     "enunciado":"Que número é \"devet\"?",
     "dica":"Vem logo antes de deset.",
     "dados":{"opcoes":["7","8","9","10"],"resposta":"9"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"enunciado":"Escreva em croata: dois",
     "dados":{"origem_pt":"dois","respostas_aceitas":["dva"]}},
    {"tipo":"traducao","peso":1.5,"enunciado":"Escreva em croata: dez",
     "dados":{"origem_pt":"dez","respostas_aceitas":["deset"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva de 1 a 5 em croata, separados por vírgula.",
     "dados":{"prompt_pt":"Escreva de 1 a 5 em croata, separados por vírgula.","max_caracteres":400}}
  ]}
]'::jsonb);

select public.criar_licao(2, 'De onze a cem', 2, '[
  {"tipo":"transformacao","titulo":"O padrão dos números","exercicios":[
    {"tipo":"escolher_forma","peso":1.5,
     "enunciado":"Os números de 11 a 19 terminam em:",
     "dica":"Compare jedanaest, dvanaest, trinaest.",
     "dados":{"opcoes":["-deset","-naest","-sto","-set"],"resposta":"-naest"}},
    {"tipo":"escolher_forma","peso":1.5,
     "enunciado":"Que número é \"jedanaest\"?",
     "dados":{"opcoes":["1","11","12","21"],"resposta":"11"}},
    {"tipo":"ligar_pares","peso":2,
     "enunciado":"Ligue cada dezena ao número.",
     "dados":{"pares":[
       {"hr":"dvadeset","pt":"20"},{"hr":"trideset","pt":"30"},
       {"hr":"pedeset","pt":"50"},{"hr":"sto","pt":"100"}]}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"enunciado":"Escreva em croata: quinze",
     "dados":{"origem_pt":"quinze","respostas_aceitas":["petnaest"]}},
    {"tipo":"traducao","peso":1.5,"enunciado":"Escreva em croata: cem",
     "dados":{"origem_pt":"cem","respostas_aceitas":["sto"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Escreva sua idade e o ano em que você nasceu, em croata.",
     "dica":"Vale usar números por extenso.",
     "dados":{"prompt_pt":"Escreva sua idade e o ano em que você nasceu, em croata.","max_caracteres":400}}
  ]}
]'::jsonb);

-- Módulo 3 --------------------------------------------------------------------
select public.criar_licao(3, 'Bok! As primeiras saudações', 1, '[
  {"tipo":"transformacao","titulo":"Que horas são?","exercicios":[
    {"tipo":"escolher_forma","peso":1.5,
     "enunciado":"Você entra num café às 9h da manhã. O que diz?",
     "dados":{"opcoes":["Dobro jutro!","Dobra večer!","Laku noć!","Doviđenja!"],"resposta":"Dobro jutro!"}},
    {"tipo":"escolher_forma","peso":1.5,
     "enunciado":"\"Molim\" serve para tudo isso, MENOS:",
     "dica":"É pedido, resposta a hvala, e pedido de repetição.",
     "dados":{"opcoes":["por favor","de nada","como?","obrigado"],"resposta":"obrigado"}},
    {"tipo":"ligar_pares","peso":2,
     "enunciado":"Ligue cada expressão ao seu uso.",
     "dados":{"pares":[
       {"hr":"Bok!","pt":"oi ou tchau, informal"},
       {"hr":"Hvala!","pt":"obrigado"},
       {"hr":"Doviđenja!","pt":"até logo, formal"},
       {"hr":"Laku noć!","pt":"boa noite, indo dormir"}]}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"enunciado":"Escreva em croata: muito obrigado",
     "dica":"Literalmente, \"obrigado bonito\".",
     "dados":{"origem_pt":"muito obrigado","respostas_aceitas":["hvala lijepa"]}},
    {"tipo":"traducao","peso":1.5,"enunciado":"Escreva em croata: boa noite (indo dormir)",
     "dados":{"origem_pt":"boa noite (indo dormir)","respostas_aceitas":["laku noć","laku noc"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Cumprimente alguém de manhã e agradeça, em croata.",
     "dados":{"prompt_pt":"Cumprimente alguém de manhã e agradeça, em croata.","max_caracteres":400}}
  ]}
]'::jsonb);

select public.criar_licao(3, 'Como você se chama?', 2, '[
  {"tipo":"transformacao","titulo":"Apresentar-se","exercicios":[
    {"tipo":"montar_frase","peso":2,
     "enunciado":"Monte a frase: \"Meu nome é Ana.\"",
     "dica":"Em croata o verbo vem antes do pronome reflexivo.",
     "dados":{"alvo_hr":"Zovem se Ana","tokens":["se","Ana","Zovem"]}},
    {"tipo":"preencher_lacuna","peso":1.5,
     "enunciado":"Complete: eu sou do Brasil.",
     "dica":"É o verbo biti na primeira pessoa.",
     "dados":{"frase_hr":"Ja ___ iz Brazila.","base_hr":"biti","resposta":"sam"}},
    {"tipo":"escolher_forma","peso":1.5,
     "enunciado":"Como se pergunta o nome de alguém formalmente?",
     "dica":"A forma formal termina em -te.",
     "dados":{"opcoes":["Kako se zoveš?","Kako se zovete?","Kako si?","Kako ste?"],"resposta":"Kako se zovete?"}}
  ]},
  {"tipo":"traducao","titulo":"Escreva em croata","exercicios":[
    {"tipo":"traducao","peso":1.5,"enunciado":"Escreva em croata: não entendo",
     "dados":{"origem_pt":"não entendo","respostas_aceitas":["ne razumijem"]}},
    {"tipo":"traducao","peso":1.5,"padez":"genitiv",
     "enunciado":"Escreva em croata: eu sou do Brasil",
     "dica":"A preposição iz sempre puxa o genitivo: Brazil vira Brazila.",
     "dados":{"origem_pt":"eu sou do Brasil","respostas_aceitas":["ja sam iz brazila","sam iz brazila"]}}
  ]},
  {"tipo":"producao_livre","titulo":"Agora é com você","exercicios":[
    {"tipo":"producao_livre","peso":2,
     "enunciado":"Apresente-se em croata: nome, de onde você é e um cumprimento.",
     "dados":{"prompt_pt":"Apresente-se em croata: nome, de onde você é e um cumprimento.","max_caracteres":400}}
  ]}
]'::jsonb);
