-- Lições dos módulos 4 a 10: um caso gramatical por módulo.
-- Gerado a partir do banco depois de aplicado, para o arquivo não divergir
-- do que está no ar. criar_licao() recusa a lição se os pesos não somarem 10
-- ou se faltar atividade da escada.
--
-- PRECISA DE REVISÃO NATIVA antes de publicar: declinação é onde erro de
-- conteúdo custa mais caro.

select public.criar_licao(4, 'Quem é? O caso do sujeito', 1, E'[
    {
        "tipo": "transformacao",
        "titulo": "A forma de dicionário",
        "exercicios": [
            {
                "dica": "O Nominativ é a forma que você encontra no Dicionário.",
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "ženu",
                        "žene",
                        "žena",
                        "ženom"
                    ],
                    "resposta": "žena"
                },
                "padez": "nominativ",
                "enunciado": "Qual destas é a forma de dicionário de \\"mulher\\"?"
            },
            {
                "dica": "Terceira pessoa do verbo biti.",
                "peso": 1.50,
                "tipo": "preencher_lacuna",
                "dados": {
                    "base_hr": "biti",
                    "frase_hr": "Ovo ___ moja sestra.",
                    "resposta": "je"
                },
                "padez": "nominativ",
                "enunciado": "Complete: esta é a minha irmã."
            },
            {
                "peso": 2.00,
                "tipo": "ligar_pares",
                "dados": {
                    "pares": [
                        {
                            "hr": "ja",
                            "pt": "eu"
                        },
                        {
                            "hr": "ti",
                            "pt": "você"
                        },
                        {
                            "hr": "on",
                            "pt": "ele"
                        },
                        {
                            "hr": "ona",
                            "pt": "ela"
                        }
                    ]
                },
                "padez": "nominativ",
                "enunciado": "Ligue cada pronome ao português."
            }
        ]
    },
    {
        "tipo": "traducao",
        "titulo": "Escreva em croata",
        "exercicios": [
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "ele é meu irmão",
                    "respostas_aceitas": [
                        "on je moj brat"
                    ]
                },
                "padez": "nominativ",
                "enunciado": "Escreva em croata: ele é meu irmão"
            },
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "ela é minha mãe",
                    "respostas_aceitas": [
                        "ona je moja majka"
                    ]
                },
                "padez": "nominativ",
                "enunciado": "Escreva em croata: ela é minha mãe"
            }
        ]
    },
    {
        "tipo": "producao_livre",
        "titulo": "Agora é com você",
        "exercicios": [
            {
                "dica": "Use ovo je... e moj / moja.",
                "peso": 2.00,
                "tipo": "producao_livre",
                "dados": {
                    "prompt_pt": "Apresente duas pessoas da sua família em croata.",
                    "max_caracteres": 400
                },
                "enunciado": "Apresente duas pessoas da sua família em croata."
            }
        ]
    }
]'::jsonb);

select public.criar_licao(4, 'Moj, moja, moje — o possessivo concorda', 2, E'[
    {
        "tipo": "transformacao",
        "titulo": "Concordância",
        "exercicios": [
            {
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "moj sestra",
                        "moja sestra",
                        "moje sestra",
                        "mojoj sestra"
                    ],
                    "resposta": "moja sestra"
                },
                "padez": "nominativ",
                "enunciado": "Como se diz \\"minha irmã\\"? (sestra é feminino)"
            },
            {
                "dica": "Masculino moj, feminino moja, neutro moje.",
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "moj mlijeko",
                        "moja mlijeko",
                        "moje mlijeko",
                        "mojem mlijeko"
                    ],
                    "resposta": "moje mlijeko"
                },
                "padez": "nominativ",
                "enunciado": "E \\"meu leite\\"? (mlijeko é neutro)"
            },
            {
                "peso": 2.00,
                "tipo": "montar_frase",
                "dados": {
                    "tokens": [
                        "je",
                        "moja",
                        "Ovo",
                        "kuća"
                    ],
                    "alvo_hr": "Ovo je moja kuća"
                },
                "padez": "nominativ",
                "enunciado": "Monte a frase: \\"Esta é a minha casa.\\""
            }
        ]
    },
    {
        "tipo": "traducao",
        "titulo": "Escreva em croata",
        "exercicios": [
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "meu pai",
                    "respostas_aceitas": [
                        "moj otac"
                    ]
                },
                "padez": "nominativ",
                "enunciado": "Escreva em croata: meu pai"
            },
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "minha casa",
                    "respostas_aceitas": [
                        "moja kuća",
                        "moja kuca"
                    ]
                },
                "padez": "nominativ",
                "enunciado": "Escreva em croata: minha casa"
            }
        ]
    },
    {
        "tipo": "producao_livre",
        "titulo": "Agora é com você",
        "exercicios": [
            {
                "peso": 2.00,
                "tipo": "producao_livre",
                "dados": {
                    "prompt_pt": "Escreva três coisas suas em croata, com moj, moja e moje.",
                    "max_caracteres": 400
                },
                "enunciado": "Escreva três coisas suas em croata, com moj, moja e moje."
            }
        ]
    }
]'::jsonb);

select public.criar_licao(5, 'O objeto direto: o que eu como e bebo', 1, '[
    {
        "tipo": "transformacao",
        "titulo": "Feminino em -a vira -u",
        "exercicios": [
            {
                "dica": "Femininos terminados em -a trocam para -u no Akuzativ.",
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "kava",
                        "kavu",
                        "kave",
                        "kavom"
                    ],
                    "resposta": "kavu"
                },
                "padez": "akuzativ",
                "enunciado": "Pijem ___. (kava)"
            },
            {
                "dica": "Masculino de coisa não muda no Akuzativ — escreva igual à forma de dicionário.",
                "peso": 1.50,
                "tipo": "preencher_lacuna",
                "dados": {
                    "base_hr": "kruh",
                    "frase_hr": "Jedem ___.",
                    "resposta": "kruh"
                },
                "padez": "akuzativ",
                "enunciado": "Complete: eu como pão."
            },
            {
                "peso": 2.00,
                "tipo": "ligar_pares",
                "dados": {
                    "pares": [
                        {
                            "hr": "voda",
                            "pt": "vodu"
                        },
                        {
                            "hr": "kava",
                            "pt": "kavu"
                        },
                        {
                            "hr": "riba",
                            "pt": "ribu"
                        },
                        {
                            "hr": "juha",
                            "pt": "juhu"
                        }
                    ]
                },
                "padez": "akuzativ",
                "enunciado": "Ligue cada palavra à sua forma no Akuzativ."
            }
        ]
    },
    {
        "tipo": "traducao",
        "titulo": "Escreva em croata",
        "exercicios": [
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "eu bebo água",
                    "respostas_aceitas": [
                        "pijem vodu",
                        "ja pijem vodu"
                    ]
                },
                "padez": "akuzativ",
                "enunciado": "Escreva em croata: eu bebo água"
            },
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "eu como pão",
                    "respostas_aceitas": [
                        "jedem kruh",
                        "ja jedem kruh"
                    ]
                },
                "padez": "akuzativ",
                "enunciado": "Escreva em croata: eu como pão"
            }
        ]
    },
    {
        "tipo": "producao_livre",
        "titulo": "Agora é com você",
        "exercicios": [
            {
                "dica": "Jedem... / Pijem...",
                "peso": 2.00,
                "tipo": "producao_livre",
                "dados": {
                    "prompt_pt": "Escreva o que você come e bebe no café da manhã, em croata.",
                    "max_caracteres": 400
                },
                "enunciado": "Escreva o que você come e bebe no café da manhã, em croata."
            }
        ]
    }
]'::jsonb);

select public.criar_licao(5, 'Para onde? O Akuzativ de movimento', 2, E'[
    {
        "tipo": "transformacao",
        "titulo": "Movimento com u e na",
        "exercicios": [
            {
                "dica": "Há movimento em direção à escola, então é Akuzativ.",
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "škola",
                        "školu",
                        "školi",
                        "školom"
                    ],
                    "resposta": "školu"
                },
                "padez": "akuzativ",
                "enunciado": "Idem u ___. (škola)"
            },
            {
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "onde?",
                        "para onde?",
                        "de onde?",
                        "com quem?"
                    ],
                    "resposta": "para onde?"
                },
                "padez": "akuzativ",
                "enunciado": "A preposição u com Akuzativ responde a qual pergunta?"
            },
            {
                "dica": "grad é masculino de coisa: não muda.",
                "peso": 2.00,
                "tipo": "montar_frase",
                "dados": {
                    "tokens": [
                        "u",
                        "grad",
                        "Idem"
                    ],
                    "alvo_hr": "Idem u grad"
                },
                "padez": "akuzativ",
                "enunciado": "Monte a frase: \\"Eu vou para a cidade.\\""
            }
        ]
    },
    {
        "tipo": "traducao",
        "titulo": "Escreva em croata",
        "exercicios": [
            {
                "dica": "Com praia usa-se na, não u.",
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "eu vou para a praia",
                    "respostas_aceitas": [
                        "idem na plažu",
                        "idem na plazu",
                        "ja idem na plažu"
                    ]
                },
                "padez": "akuzativ",
                "enunciado": "Escreva em croata: eu vou para a praia"
            },
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "eu vou para a escola",
                    "respostas_aceitas": [
                        "idem u školu",
                        "idem u skolu",
                        "ja idem u školu"
                    ]
                },
                "padez": "akuzativ",
                "enunciado": "Escreva em croata: eu vou para a escola"
            }
        ]
    },
    {
        "tipo": "producao_livre",
        "titulo": "Agora é com você",
        "exercicios": [
            {
                "peso": 2.00,
                "tipo": "producao_livre",
                "dados": {
                    "prompt_pt": "Escreva para onde você vai hoje, em croata.",
                    "max_caracteres": 400
                },
                "enunciado": "Escreva para onde você vai hoje, em croata."
            }
        ]
    }
]'::jsonb);

select public.criar_licao(6, 'De quem é? O Genitiv de posse', 1, '[
    {
        "tipo": "transformacao",
        "titulo": "Posse e origem",
        "exercicios": [
            {
                "dica": "Femininos em -a viram -e no Genitiv.",
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "sestra",
                        "sestru",
                        "sestre",
                        "sestrom"
                    ],
                    "resposta": "sestre"
                },
                "padez": "genitiv",
                "enunciado": "kuća moje ___ (sestra) — a casa da minha irmã"
            },
            {
                "peso": 1.50,
                "tipo": "preencher_lacuna",
                "dados": {
                    "base_hr": "voda",
                    "frase_hr": "Ovo je čaša ___.",
                    "resposta": "vode"
                },
                "padez": "genitiv",
                "enunciado": "Complete: este é um copo de água."
            },
            {
                "dica": "Masculino e neutro ganham -a; feminino em -a vira -e.",
                "peso": 2.00,
                "tipo": "ligar_pares",
                "dados": {
                    "pares": [
                        {
                            "hr": "brat",
                            "pt": "brata"
                        },
                        {
                            "hr": "sestra",
                            "pt": "sestre"
                        },
                        {
                            "hr": "more",
                            "pt": "mora"
                        },
                        {
                            "hr": "grad",
                            "pt": "grada"
                        }
                    ]
                },
                "padez": "genitiv",
                "enunciado": "Ligue cada palavra à sua forma no Genitiv."
            }
        ]
    },
    {
        "tipo": "traducao",
        "titulo": "Escreva em croata",
        "exercicios": [
            {
                "dica": "A preposição bez sempre puxa o Genitiv.",
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "sem água",
                    "respostas_aceitas": [
                        "bez vode"
                    ]
                },
                "padez": "genitiv",
                "enunciado": "Escreva em croata: sem água"
            },
            {
                "dica": "A preposição iz também puxa o Genitiv.",
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "eu sou do Brasil",
                    "respostas_aceitas": [
                        "ja sam iz brazila",
                        "sam iz brazila"
                    ]
                },
                "padez": "genitiv",
                "enunciado": "Escreva em croata: eu sou do Brasil"
            }
        ]
    },
    {
        "tipo": "producao_livre",
        "titulo": "Agora é com você",
        "exercicios": [
            {
                "peso": 2.00,
                "tipo": "producao_livre",
                "dados": {
                    "prompt_pt": "Diga de onde você é e de que cidade vem, em croata.",
                    "max_caracteres": 400
                },
                "enunciado": "Diga de onde você é e de que cidade vem, em croata."
            }
        ]
    }
]'::jsonb);

select public.criar_licao(6, 'Nema: o Genitiv da ausência', 2, E'[
    {
        "tipo": "transformacao",
        "titulo": "Quando não tem",
        "exercicios": [
            {
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "kava",
                        "kavu",
                        "kave",
                        "kavom"
                    ],
                    "resposta": "kave"
                },
                "padez": "genitiv",
                "enunciado": "Nema ___. (kava) — não tem café"
            },
            {
                "dica": "Em croata, o que falta fica no caso da ausência.",
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "Nominativ",
                        "Akuzativ",
                        "Genitiv",
                        "Lokativ"
                    ],
                    "resposta": "Genitiv"
                },
                "padez": "genitiv",
                "enunciado": "Depois de nema vem sempre qual caso?"
            },
            {
                "peso": 2.00,
                "tipo": "montar_frase",
                "dados": {
                    "tokens": [
                        "vode",
                        "Nema"
                    ],
                    "alvo_hr": "Nema vode"
                },
                "padez": "genitiv",
                "enunciado": "Monte a frase: \\"Não tem água.\\""
            }
        ]
    },
    {
        "tipo": "traducao",
        "titulo": "Escreva em croata",
        "exercicios": [
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "não tem pão",
                    "respostas_aceitas": [
                        "nema kruha"
                    ]
                },
                "padez": "genitiv",
                "enunciado": "Escreva em croata: não tem pão"
            },
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "um copo de leite",
                    "respostas_aceitas": [
                        "čaša mlijeka",
                        "casa mlijeka"
                    ]
                },
                "padez": "genitiv",
                "enunciado": "Escreva em croata: um copo de leite"
            }
        ]
    },
    {
        "tipo": "producao_livre",
        "titulo": "Agora é com você",
        "exercicios": [
            {
                "peso": 2.00,
                "tipo": "producao_livre",
                "dados": {
                    "prompt_pt": "Escreva três coisas que faltam na sua geladeira, usando nema.",
                    "max_caracteres": 400
                },
                "enunciado": "Escreva três coisas que faltam na sua geladeira, usando nema."
            }
        ]
    }
]'::jsonb);

select public.criar_licao(7, 'Para quem? O objeto indireto', 1, '[
    {
        "tipo": "transformacao",
        "titulo": "Quem recebe",
        "exercicios": [
            {
                "dica": "Femininos em -a viram -i no Dativ.",
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "sestra",
                        "sestru",
                        "sestre",
                        "sestri"
                    ],
                    "resposta": "sestri"
                },
                "padez": "dativ",
                "enunciado": "Dajem knjigu ___. (sestra) — dou o livro para a irmã"
            },
            {
                "dica": "Masculino ganha -u no Dativ.",
                "peso": 1.50,
                "tipo": "preencher_lacuna",
                "dados": {
                    "base_hr": "brat",
                    "frase_hr": "Pišem ___.",
                    "resposta": "bratu"
                },
                "padez": "dativ",
                "enunciado": "Complete: escrevo para o irmão."
            },
            {
                "dica": "Atenção em majka: o k vira c antes do -i.",
                "peso": 2.00,
                "tipo": "ligar_pares",
                "dados": {
                    "pares": [
                        {
                            "hr": "brat",
                            "pt": "bratu"
                        },
                        {
                            "hr": "žena",
                            "pt": "ženi"
                        },
                        {
                            "hr": "majka",
                            "pt": "majci"
                        },
                        {
                            "hr": "prijatelj",
                            "pt": "prijatelju"
                        }
                    ]
                },
                "padez": "dativ",
                "enunciado": "Ligue cada palavra à sua forma no Dativ."
            }
        ]
    },
    {
        "tipo": "traducao",
        "titulo": "Escreva em croata",
        "exercicios": [
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "para a mãe",
                    "respostas_aceitas": [
                        "majci"
                    ]
                },
                "padez": "dativ",
                "enunciado": "Escreva em croata: para a mãe"
            },
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "para o amigo",
                    "respostas_aceitas": [
                        "prijatelju"
                    ]
                },
                "padez": "dativ",
                "enunciado": "Escreva em croata: para o amigo"
            }
        ]
    },
    {
        "tipo": "producao_livre",
        "titulo": "Agora é com você",
        "exercicios": [
            {
                "peso": 2.00,
                "tipo": "producao_livre",
                "dados": {
                    "prompt_pt": "Escreva para quem você daria um presente, em croata.",
                    "max_caracteres": 400
                },
                "enunciado": "Escreva para quem você daria um presente, em croata."
            }
        ]
    }
]'::jsonb);

select public.criar_licao(7, 'Gostar em croata é ao contrário', 2, E'[
    {
        "tipo": "transformacao",
        "titulo": "Sviđa mi se",
        "exercicios": [
            {
                "dica": "Ao pé da letra: isso agrada a mim.",
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "Sviđa mi se",
                        "Sviđa me se",
                        "Sviđam se",
                        "Sviđa mene"
                    ],
                    "resposta": "Sviđa mi se"
                },
                "padez": "dativ",
                "enunciado": "Como se diz \\"eu gosto disso\\"?"
            },
            {
                "dica": "Quem gosta recebe a ação, não a pratica.",
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "Nominativ",
                        "Dativ",
                        "Akuzativ",
                        "Genitiv"
                    ],
                    "resposta": "Dativ"
                },
                "padez": "dativ",
                "enunciado": "Em \\"Sviđa mi se\\", quem gosta está em qual caso?"
            },
            {
                "dica": "O mar é o sujeito: é ele que agrada.",
                "peso": 2.00,
                "tipo": "montar_frase",
                "dados": {
                    "tokens": [
                        "mi",
                        "se",
                        "more",
                        "Sviđa"
                    ],
                    "alvo_hr": "Sviđa mi se more"
                },
                "padez": "dativ",
                "enunciado": "Monte a frase: \\"Eu gosto do mar.\\""
            }
        ]
    },
    {
        "tipo": "traducao",
        "titulo": "Escreva em croata",
        "exercicios": [
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "eu gosto do mar",
                    "respostas_aceitas": [
                        "sviđa mi se more",
                        "svida mi se more"
                    ]
                },
                "padez": "dativ",
                "enunciado": "Escreva em croata: eu gosto do mar"
            },
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "para a amiga",
                    "respostas_aceitas": [
                        "prijateljici"
                    ]
                },
                "padez": "dativ",
                "enunciado": "Escreva em croata: para a amiga"
            }
        ]
    },
    {
        "tipo": "producao_livre",
        "titulo": "Agora é com você",
        "exercicios": [
            {
                "peso": 2.00,
                "tipo": "producao_livre",
                "dados": {
                    "prompt_pt": "Escreva duas coisas de que você gosta, usando sviđa mi se.",
                    "max_caracteres": 400
                },
                "enunciado": "Escreva duas coisas de que você gosta, usando sviđa mi se."
            }
        ]
    }
]'::jsonb);

select public.criar_licao(8, 'Onde está? O caso do lugar parado', 1, E'[
    {
        "tipo": "transformacao",
        "titulo": "Parado, não indo",
        "exercicios": [
            {
                "dica": "Ninguém se move: é lugar parado, então Lokativ.",
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "škola",
                        "školu",
                        "školi",
                        "školom"
                    ],
                    "resposta": "školi"
                },
                "padez": "lokativ",
                "enunciado": "Djeca su u ___. (škola) — as crianças estão na escola"
            },
            {
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "de onde?",
                        "onde?",
                        "com quem?",
                        "para quem?"
                    ],
                    "resposta": "onde?"
                },
                "padez": "lokativ",
                "enunciado": "u + Akuzativ é \\"para onde\\". u + Lokativ responde:"
            },
            {
                "peso": 2.00,
                "tipo": "ligar_pares",
                "dados": {
                    "pares": [
                        {
                            "hr": "kuća",
                            "pt": "u kući"
                        },
                        {
                            "hr": "grad",
                            "pt": "u gradu"
                        },
                        {
                            "hr": "more",
                            "pt": "na moru"
                        },
                        {
                            "hr": "stol",
                            "pt": "na stolu"
                        }
                    ]
                },
                "padez": "lokativ",
                "enunciado": "Ligue cada lugar à forma com preposição."
            }
        ]
    },
    {
        "tipo": "traducao",
        "titulo": "Escreva em croata",
        "exercicios": [
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "em casa",
                    "respostas_aceitas": [
                        "u kući",
                        "u kuci"
                    ]
                },
                "padez": "lokativ",
                "enunciado": "Escreva em croata: em casa"
            },
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "na cidade",
                    "respostas_aceitas": [
                        "u gradu"
                    ]
                },
                "padez": "lokativ",
                "enunciado": "Escreva em croata: na cidade"
            }
        ]
    },
    {
        "tipo": "producao_livre",
        "titulo": "Agora é com você",
        "exercicios": [
            {
                "peso": 2.00,
                "tipo": "producao_livre",
                "dados": {
                    "prompt_pt": "Escreva onde você está agora e onde estão duas coisas da sala.",
                    "max_caracteres": 400
                },
                "enunciado": "Escreva onde você está agora e onde estão duas coisas da sala."
            }
        ]
    }
]'::jsonb);

select public.criar_licao(8, 'u ou na? Dentro e em cima', 2, E'[
    {
        "tipo": "transformacao",
        "titulo": "Escolhendo a preposição",
        "exercicios": [
            {
                "dica": "Praia, ilha e superfícies abertas pedem na.",
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "u plaži",
                        "na plaži",
                        "na plažu",
                        "u plažu"
                    ],
                    "resposta": "na plaži"
                },
                "padez": "lokativ",
                "enunciado": "Como se diz \\"na praia\\"?"
            },
            {
                "peso": 1.50,
                "tipo": "preencher_lacuna",
                "dados": {
                    "base_hr": "stol",
                    "frase_hr": "Knjiga je na ___.",
                    "resposta": "stolu"
                },
                "padez": "lokativ",
                "enunciado": "Complete: o livro está sobre a mesa."
            },
            {
                "peso": 2.00,
                "tipo": "montar_frase",
                "dados": {
                    "tokens": [
                        "je",
                        "u",
                        "kuhinji",
                        "Mačka"
                    ],
                    "alvo_hr": "Mačka je u kuhinji"
                },
                "padez": "lokativ",
                "enunciado": "Monte a frase: \\"O gato está na cozinha.\\""
            }
        ]
    },
    {
        "tipo": "traducao",
        "titulo": "Escreva em croata",
        "exercicios": [
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "no mar",
                    "respostas_aceitas": [
                        "na moru"
                    ]
                },
                "padez": "lokativ",
                "enunciado": "Escreva em croata: no mar"
            },
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "na escola",
                    "respostas_aceitas": [
                        "u školi",
                        "u skoli"
                    ]
                },
                "padez": "lokativ",
                "enunciado": "Escreva em croata: na escola"
            }
        ]
    },
    {
        "tipo": "producao_livre",
        "titulo": "Agora é com você",
        "exercicios": [
            {
                "peso": 2.00,
                "tipo": "producao_livre",
                "dados": {
                    "prompt_pt": "Descreva onde ficam três lugares da sua cidade, em croata.",
                    "max_caracteres": 400
                },
                "enunciado": "Descreva onde ficam três lugares da sua cidade, em croata."
            }
        ]
    }
]'::jsonb);

select public.criar_licao(9, 'Com quem? O caso da companhia', 1, E'[
    {
        "tipo": "transformacao",
        "titulo": "s / sa + Instrumental",
        "exercicios": [
            {
                "dica": "Femininos em -a viram -om no Instrumental.",
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "žena",
                        "ženu",
                        "ženi",
                        "ženom"
                    ],
                    "resposta": "ženom"
                },
                "padez": "instrumental",
                "enunciado": "Putujem sa ___. (žena) — viajo com a esposa"
            },
            {
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "s / sa + Instrumental",
                        "u + Lokativ",
                        "iz + Genitiv",
                        "na + Akuzativ"
                    ],
                    "resposta": "s / sa + Instrumental"
                },
                "padez": "instrumental",
                "enunciado": "Para dizer \\"com alguém\\", usa-se:"
            },
            {
                "dica": "Antes de palavra que começa com s ou z usa-se sa, para não travar a língua.",
                "peso": 2.00,
                "tipo": "ligar_pares",
                "dados": {
                    "pares": [
                        {
                            "hr": "brat",
                            "pt": "s bratom"
                        },
                        {
                            "hr": "sestra",
                            "pt": "sa sestrom"
                        },
                        {
                            "hr": "majka",
                            "pt": "s majkom"
                        },
                        {
                            "hr": "prijatelj",
                            "pt": "s prijateljem"
                        }
                    ]
                },
                "padez": "instrumental",
                "enunciado": "Ligue cada pessoa à forma de companhia."
            }
        ]
    },
    {
        "tipo": "traducao",
        "titulo": "Escreva em croata",
        "exercicios": [
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "com o irmão",
                    "respostas_aceitas": [
                        "s bratom",
                        "sa bratom"
                    ]
                },
                "padez": "instrumental",
                "enunciado": "Escreva em croata: com o irmão"
            },
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "com a mãe",
                    "respostas_aceitas": [
                        "s majkom",
                        "sa majkom"
                    ]
                },
                "padez": "instrumental",
                "enunciado": "Escreva em croata: com a mãe"
            }
        ]
    },
    {
        "tipo": "producao_livre",
        "titulo": "Agora é com você",
        "exercicios": [
            {
                "peso": 2.00,
                "tipo": "producao_livre",
                "dados": {
                    "prompt_pt": "Escreva com quem você mora e com quem você viaja, em croata.",
                    "max_caracteres": 400
                },
                "enunciado": "Escreva com quem você mora e com quem você viaja, em croata."
            }
        ]
    }
]'::jsonb);

select public.criar_licao(9, 'De carro, de ônibus: o meio não leva preposição', 2, E'[
    {
        "tipo": "transformacao",
        "titulo": "Companhia x meio",
        "exercicios": [
            {
                "dica": "Aqui o carro é o meio, não a companhia.",
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "s autom",
                        "autom",
                        "u autu",
                        "na auto"
                    ],
                    "resposta": "autom"
                },
                "padez": "instrumental",
                "enunciado": "Como se diz \\"de carro\\"? (auto)"
            },
            {
                "dica": "Você viaja com a irmã, mas viaja de ônibus.",
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "é sempre s",
                        "é sempre sa",
                        "não existe",
                        "vira u"
                    ],
                    "resposta": "não existe"
                },
                "padez": "instrumental",
                "enunciado": "Quando o Instrumental indica meio, a preposição:"
            },
            {
                "peso": 2.00,
                "tipo": "montar_frase",
                "dados": {
                    "tokens": [
                        "autobusom",
                        "Idem"
                    ],
                    "alvo_hr": "Idem autobusom"
                },
                "padez": "instrumental",
                "enunciado": "Monte a frase: \\"Eu vou de ônibus.\\""
            }
        ]
    },
    {
        "tipo": "traducao",
        "titulo": "Escreva em croata",
        "exercicios": [
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "de ônibus",
                    "respostas_aceitas": [
                        "autobusom"
                    ]
                },
                "padez": "instrumental",
                "enunciado": "Escreva em croata: de ônibus"
            },
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "com o amigo",
                    "respostas_aceitas": [
                        "s prijateljem",
                        "sa prijateljem"
                    ]
                },
                "padez": "instrumental",
                "enunciado": "Escreva em croata: com o amigo"
            }
        ]
    },
    {
        "tipo": "producao_livre",
        "titulo": "Agora é com você",
        "exercicios": [
            {
                "peso": 2.00,
                "tipo": "producao_livre",
                "dados": {
                    "prompt_pt": "Escreva como você vai ao trabalho ou à escola, em croata.",
                    "max_caracteres": 400
                },
                "enunciado": "Escreva como você vai ao trabalho ou à escola, em croata."
            }
        ]
    }
]'::jsonb);

select public.criar_licao(10, 'Chamando alguém pelo nome', 1, '[
    {
        "tipo": "transformacao",
        "titulo": "O caso de chamar",
        "exercicios": [
            {
                "dica": "Masculinos costumam ganhar -e no Vokativ.",
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "Ivan",
                        "Ivane",
                        "Ivanu",
                        "Ivanom"
                    ],
                    "resposta": "Ivane"
                },
                "padez": "vokativ",
                "enunciado": "Você quer chamar o Ivan. Como fica o nome dele?"
            },
            {
                "dica": "Femininos em -a trocam para -o.",
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "Ana",
                        "Anu",
                        "Ano",
                        "Ani"
                    ],
                    "resposta": "Ano"
                },
                "padez": "vokativ",
                "enunciado": "E Ana, no Vokativ, vira:"
            },
            {
                "peso": 2.00,
                "tipo": "ligar_pares",
                "dados": {
                    "pares": [
                        {
                            "hr": "Ivan",
                            "pt": "Ivane"
                        },
                        {
                            "hr": "Ana",
                            "pt": "Ano"
                        },
                        {
                            "hr": "majka",
                            "pt": "majko"
                        },
                        {
                            "hr": "prijatelj",
                            "pt": "prijatelju"
                        }
                    ]
                },
                "padez": "vokativ",
                "enunciado": "Ligue cada palavra à forma usada para chamar."
            }
        ]
    },
    {
        "tipo": "traducao",
        "titulo": "Escreva em croata",
        "exercicios": [
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "mãe! (chamando)",
                    "respostas_aceitas": [
                        "majko"
                    ]
                },
                "padez": "vokativ",
                "enunciado": "Escreva em croata: mãe! (chamando)"
            },
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "amigo! (chamando)",
                    "respostas_aceitas": [
                        "prijatelju"
                    ]
                },
                "padez": "vokativ",
                "enunciado": "Escreva em croata: amigo! (chamando)"
            }
        ]
    },
    {
        "tipo": "producao_livre",
        "titulo": "Agora é com você",
        "exercicios": [
            {
                "peso": 2.00,
                "tipo": "producao_livre",
                "dados": {
                    "prompt_pt": "Cumprimente três pessoas pelo nome, em croata, usando o Vokativ.",
                    "max_caracteres": 400
                },
                "enunciado": "Cumprimente três pessoas pelo nome, em croata, usando o Vokativ."
            }
        ]
    }
]'::jsonb);

select public.criar_licao(10, 'O caso que se ouve mais do que se lê', 2, E'[
    {
        "tipo": "transformacao",
        "titulo": "Vokativ no dia a dia",
        "exercicios": [
            {
                "peso": 1.50,
                "tipo": "escolher_forma",
                "dados": {
                    "opcoes": [
                        "É plural",
                        "É o Vokativ, usado para chamar",
                        "É o Genitiv",
                        "É erro de digitação"
                    ],
                    "resposta": "É o Vokativ, usado para chamar"
                },
                "padez": "vokativ",
                "enunciado": "Em \\"Bok, Ivane!\\", por que não é \\"Ivan\\"?"
            },
            {
                "peso": 1.50,
                "tipo": "preencher_lacuna",
                "dados": {
                    "base_hr": "prijatelj",
                    "frase_hr": "Hvala, ___!",
                    "resposta": "prijatelju"
                },
                "padez": "vokativ",
                "enunciado": "Complete: obrigado, amigo!"
            },
            {
                "peso": 2.00,
                "tipo": "montar_frase",
                "dados": {
                    "tokens": [
                        "jutro,",
                        "Ano",
                        "Dobro"
                    ],
                    "alvo_hr": "Dobro jutro, Ano"
                },
                "padez": "vokativ",
                "enunciado": "Monte a frase: \\"Bom dia, Ana!\\""
            }
        ]
    },
    {
        "tipo": "traducao",
        "titulo": "Escreva em croata",
        "exercicios": [
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "obrigado, amigo!",
                    "respostas_aceitas": [
                        "hvala, prijatelju",
                        "hvala prijatelju"
                    ]
                },
                "padez": "vokativ",
                "enunciado": "Escreva em croata: obrigado, amigo!"
            },
            {
                "peso": 1.50,
                "tipo": "traducao",
                "dados": {
                    "origem_pt": "boa noite, mãe! (indo dormir)",
                    "respostas_aceitas": [
                        "laku noć, majko",
                        "laku noc majko",
                        "laku noć majko",
                        "laku noc, majko"
                    ]
                },
                "padez": "vokativ",
                "enunciado": "Escreva em croata: boa noite, mãe! (indo dormir)"
            }
        ]
    },
    {
        "tipo": "producao_livre",
        "titulo": "Agora é com você",
        "exercicios": [
            {
                "peso": 2.00,
                "tipo": "producao_livre",
                "dados": {
                    "prompt_pt": "Escreva uma despedida curta para alguém, chamando a pessoa pelo nome.",
                    "max_caracteres": 400
                },
                "enunciado": "Escreva uma despedida curta para alguém, chamando a pessoa pelo nome."
            }
        ]
    }
]'::jsonb);
