-- Seed de teste: 40 argumentos em tópicos polêmicos + 15 usuários fake.
-- IDs são TEXT (cuid no schema), então qualquer string única funciona.
-- updatedAt não tem default no DB (Prisma gerencia) — precisa ser explícito.
-- Re-executável: usa ON CONFLICT em chaves únicas.

BEGIN;

-- ─── TÓPICOS POLÊMICOS ────────────────────────────────────────────────
INSERT INTO public."Topic" (id, slug, name, description) VALUES
  ('seed_topic_aborto',    'aborto',              'Aborto',                'Debates sobre legalização, ética e saúde pública relacionados ao aborto.'),
  ('seed_topic_drogas',    'drogas',              'Drogas',                'Descriminalização, política de drogas e redução de danos.'),
  ('seed_topic_polbr',     'politica-br',         'Política Brasileira',   'Conjuntura, instituições e reformas políticas no Brasil.'),
  ('seed_topic_capital',   'capitalismo',         'Capitalismo',           'Mercado, propriedade privada, desigualdade e modelos econômicos.'),
  ('seed_topic_armas',     'armas',               'Armas de Fogo',         'Direito a porte de armas, desarmamento e segurança pública.'),
  ('seed_topic_vegan',     'veganismo',           'Veganismo',             'Ética animal, pecuária, alimentação e meio ambiente.'),
  ('seed_topic_clima',     'mudancas-climaticas', 'Mudanças Climáticas',   'Crise climática, energia, transição ecológica e responsabilidades.'),
  ('seed_topic_ia',        'ia',                  'Inteligência Artificial','IA generativa, regulação, trabalho e direitos autorais.'),
  ('seed_topic_fem',       'feminismo',           'Feminismo',             'Movimentos, equidade, cotas e debates internos do feminismo.'),
  ('seed_topic_ateu',      'ateismo',             'Ateísmo',               'Debates sobre ateísmo, ceticismo e religião.'),
  ('seed_topic_relig',     'religiao',            'Religião',              'Teologia, espiritualidade e tradições religiosas.'),
  ('seed_topic_filo',      'filosofia',           'Filosofia',             'Ética, epistemologia, metafísica e correntes filosóficas.'),
  ('seed_topic_cien',      'ciencia',             'Ciência',               'Método científico, descobertas e divulgação científica.')
ON CONFLICT (slug) DO NOTHING;

-- (ateismo, religiao, filosofia e ciencia também existem no seed.ts —
-- ──────────────────────────────────────────────────────────────────────

-- ─── USUÁRIOS FAKE ────────────────────────────────────────────────────
INSERT INTO public."User" (id, name, email, username, bio, "createdAt", "updatedAt") VALUES
  ('seed_user_01', 'Pedro Libertário',     'pedro.lib@test.local',      'pedro_libertario', 'Liberdade individual acima de tudo.',                   NOW(), NOW()),
  ('seed_user_02', 'Ana Crítica',          'ana.critica@test.local',    'ana_critica',      'Cética profissional. Pergunto antes de aceitar.',       NOW(), NOW()),
  ('seed_user_03', 'Lucas Dev',            'lucas.dev@test.local',      'lucas_dev',        'Engenheiro de software. Café antes de tudo.',           NOW(), NOW()),
  ('seed_user_04', 'Mariana Cética',       'mari.cet@test.local',       'mariana_cetica',   'Ciência > intuição. Sempre.',                           NOW(), NOW()),
  ('seed_user_05', 'Rafael Filo',          'rafa.filo@test.local',      'rafael_filo',      'Filosofia analítica e debate público.',                 NOW(), NOW()),
  ('seed_user_06', 'Juliana Ativista',     'ju.ativ@test.local',        'juliana_ativ',     'Direitos humanos e equidade.',                          NOW(), NOW()),
  ('seed_user_07', 'Bruno Economista',     'bruno.eco@test.local',      'bruno_economista', 'Macro, micro e tudo que tem preço.',                    NOW(), NOW()),
  ('seed_user_08', 'Camila Bióloga',       'cami.bio@test.local',       'camila_bio',       'Biologia, ecologia e divulgação científica.',           NOW(), NOW()),
  ('seed_user_09', 'Fernando Teólogo',     'fer.teo@test.local',        'fernando_teo',     'Teologia, fé e tradição.',                              NOW(), NOW()),
  ('seed_user_10', 'Patrícia Feminista',   'pati.fem@test.local',       'patricia_fem',     'Feminismo de classe e cotas.',                          NOW(), NOW()),
  ('seed_user_11', 'Gabriel Programador',  'gabi.prog@test.local',      'gabriel_progr',    'Backend, sistemas distribuídos e gatos.',               NOW(), NOW()),
  ('seed_user_12', 'Larissa Vegana',       'lari.veg@test.local',       'larissa_vegan',    'Ética animal e culinária plant-based.',                 NOW(), NOW()),
  ('seed_user_13', 'Eduardo Político',     'edu.pol@test.local',        'eduardo_pol',      'Direita liberal. Discordância com civilidade.',         NOW(), NOW()),
  ('seed_user_14', 'Beatriz Psicóloga',    'bea.psi@test.local',        'beatriz_psi',      'Psicologia social e saúde mental.',                     NOW(), NOW()),
  ('seed_user_15', 'Matheus Engenheiro',   'mat.eng@test.local',        'matheus_eng',      'Engenharia nuclear e energia limpa.',                   NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ─── 40 ARGUMENTOS ────────────────────────────────────────────────────
-- Helper: topicId via subquery por slug; authorId pelos IDs determinísticos acima.

INSERT INTO public."Argument" (id, slug, title, content, "authorId", "topicId", depth, upvotes, downvotes, score, "hotScore", "createdAt", "updatedAt") VALUES

-- ABORTO (4)
('seed_arg_01', 'aborto-12-semanas-legal',
 'Direito ao aborto até a 12ª semana deveria ser legal no Brasil',
 'A criminalização não reduz o número de abortos — apenas empurra mulheres pobres para procedimentos inseguros. Países que legalizaram com prazo de 12 semanas viram queda na mortalidade materna sem aumento estatístico no número total de procedimentos.',
 'seed_user_01', (SELECT id FROM public."Topic" WHERE slug='aborto'), 0, 142, 87,  55,  0, NOW(), NOW()),

('seed_arg_02', 'aborto-saude-publica',
 'Aborto é tema de saúde pública, não de moral religiosa',
 'Decisões clínicas sobre o próprio corpo não cabem em código penal. Misturar dogma religioso com legislação de saúde mata mulheres reais — sobretudo pretas e periféricas, que não têm acesso às clínicas privadas que sempre existiram para a classe média.',
 'seed_user_02', (SELECT id FROM public."Topic" WHERE slug='aborto'), 0, 198, 134, 64,  0, NOW(), NOW()),

('seed_arg_03', 'aborto-vida-desde-concepcao',
 'Defender a vida desde a concepção é a posição mais coerente',
 'Se o critério para proteger a vida humana é arbitrário (12, 20, 24 semanas), por que parar aí? Coerência exige proteger desde o início. O debate sério não é sobre autonomia, é sobre quando começa a vida que merece proteção — e a biologia responde claramente.',
 'seed_user_09', (SELECT id FROM public."Topic" WHERE slug='aborto'), 0, 76,  121, -45, 0, NOW(), NOW()),

('seed_arg_04', 'aborto-viabilidade-fetal',
 'Critério da viabilidade fetal é mais sensato que prazos arbitrários',
 'Cravar 12 ou 14 semanas é tão arbitrário quanto proibir tudo. O critério científico defensável é viabilidade fora do útero — hoje em torno de 22-24 semanas. Isso respeita tanto a autonomia quanto o desenvolvimento biológico observável.',
 'seed_user_04', (SELECT id FROM public."Topic" WHERE slug='aborto'), 0, 89,  41,  48,  0, NOW(), NOW()),

-- DROGAS (4)
('seed_arg_05', 'guerra-drogas-falhou',
 'Guerra às drogas falhou: descriminalizar é o único caminho',
 'Cinco décadas, trilhões gastos, milhões presos, e o consumo só cresceu. A guerra às drogas é a política pública mais fracassada da história moderna. Descriminalizar não é incentivar — é parar de fingir que prisão resolve dependência química.',
 'seed_user_01', (SELECT id FROM public."Topic" WHERE slug='drogas'), 0, 234, 78,  156, 0, NOW(), NOW()),

('seed_arg_06', 'cannabis-medicinal-bloqueio',
 'Cannabis medicinal já provou seu valor — bloqueio é ideológico',
 'Existe literatura revisada por pares sobre eficácia em epilepsia refratária, dor crônica e náusea por quimioterapia. Manter pacientes brasileiros importando óleo a R$ 3 mil/mês enquanto poderíamos produzir aqui é crueldade fantasiada de princípio moral.',
 'seed_user_08', (SELECT id FROM public."Topic" WHERE slug='drogas'), 0, 187, 32,  155, 0, NOW(), NOW()),

('seed_arg_07', 'liberar-drogas-amplia-vicio',
 'Liberar drogas não resolve o vício, só amplia o problema',
 'Acesso facilitado a substâncias que sequestram o sistema de recompensa cerebral expande o universo de dependentes. Países que liberalizaram demais já estão recuando. Redução de danos sim, mas chamar liberação geral de "solução" é simplista.',
 'seed_user_13', (SELECT id FROM public."Topic" WHERE slug='drogas'), 0, 92,  118, -26, 0, NOW(), NOW()),

('seed_arg_08', 'portugal-descrim-funcionou',
 'Portugal mostra que descriminalização reduz mortes',
 'Desde 2001 Portugal tratou posse como questão de saúde, não criminal. Resultado: overdose despencou, infecção por HIV via uso injetável caiu drasticamente, e a taxa de consumo ficou abaixo da média europeia. Os dados estão aí há 25 anos.',
 'seed_user_03', (SELECT id FROM public."Topic" WHERE slug='drogas'), 0, 167, 24,  143, 0, NOW(), NOW()),

-- POLÍTICA BR (4)
('seed_arg_09', 'voto-obrigatorio-acabar',
 'Voto obrigatório infantiliza o eleitor e deveria acabar',
 'Obrigar voto produz eleitorado desinteressado que decide na cabine. Países com voto facultativo têm participação informada mais alta proporcionalmente. Cidadania não se constrói por coerção legal — se constrói por educação política real.',
 'seed_user_07', (SELECT id FROM public."Topic" WHERE slug='politica-br'), 0, 121, 89,  32,  0, NOW(), NOW()),

('seed_arg_10', 'reforma-tributaria-beneficia-topo',
 'Reforma tributária aprovada beneficia mais o topo da pirâmide',
 'Unificar tributos sobre consumo sem mexer significativamente em renda e patrimônio mantém a regressividade do sistema brasileiro. Quem ganha 2 salários gasta 100% — quem ganha 200 gasta 20%. O peso continua sobre quem menos pode pagar.',
 'seed_user_13', (SELECT id FROM public."Topic" WHERE slug='politica-br'), 0, 156, 67,  89,  0, NOW(), NOW()),

('seed_arg_11', 'presidencialismo-crises',
 'Sistema presidencialista no Brasil gera crises recorrentes',
 'Presidente sem maioria parlamentar = paralisia ou "presidencialismo de coalizão" (eufemismo para troca de cargos por votos). Parlamentarismo permitiria trocar primeiro-ministro sem trauma institucional. Nossa Constituição escolheu o sistema mais instável.',
 'seed_user_05', (SELECT id FROM public."Topic" WHERE slug='politica-br'), 0, 78,  54,  24,  0, NOW(), NOW()),

('seed_arg_12', 'maioridade-penal-simplista',
 'Reduzir maioridade penal é solução simplista para problema complexo',
 'Adolescente em conflito com a lei comete em sua maioria delitos não-violentos. Encarcerar com adultos é fábrica de reincidência — literatura criminológica é unânime. A causa estrutural é abandono educacional, não brandura penal.',
 'seed_user_14', (SELECT id FROM public."Topic" WHERE slug='politica-br'), 0, 134, 156, -22, 0, NOW(), NOW()),

-- CAPITALISMO (4)
('seed_arg_13', 'capitalismo-tirou-miseria',
 'Capitalismo tirou mais gente da miséria que qualquer outro sistema',
 'Entre 1990 e 2020 a pobreza extrema mundial caiu de ~36% para menos de 9%. Isso aconteceu sob globalização e abertura de mercados, principalmente na Ásia. Nenhum sistema alternativo entregou redução de pobreza nessa escala — fato, não opinião.',
 'seed_user_07', (SELECT id FROM public."Topic" WHERE slug='capitalismo'), 0, 198, 102, 96,  0, NOW(), NOW()),

('seed_arg_14', 'desigualdade-falha-estrutural',
 'Desigualdade é falha estrutural, não mérito individual',
 'O bilionário "self-made" usou estradas públicas, judiciário público, mão de obra escolarizada com dinheiro público. Meritocracia pura é mito — todo sucesso individual depende de infraestrutura coletiva pré-existente. Negar isso é desonestidade intelectual.',
 'seed_user_10', (SELECT id FROM public."Topic" WHERE slug='capitalismo'), 0, 167, 89,  78,  0, NOW(), NOW()),

('seed_arg_15', 'mercado-livre-estado-forte',
 'Mercado livre exige Estado forte, não ausência de Estado',
 'Contratos sem Judiciário não valem nada. Propriedade sem polícia é folclore. Concorrência sem regulação antitruste vira monopólio. Liberalismo econômico sério (Smith, Hayek) sempre pressupôs Estado robusto em suas funções nucleares. Anarcocapitalismo é caricatura.',
 'seed_user_07', (SELECT id FROM public."Topic" WHERE slug='capitalismo'), 0, 145, 28,  117, 0, NOW(), NOW()),

('seed_arg_16', 'propriedade-privada-inovacao',
 'Sem propriedade privada não existe inovação real',
 'Quem investe 10 anos pesquisando precisa colher. Patentes, marcas, royalties: tudo isso é propriedade. Países que aboliram propriedade privada produtiva entraram em estagnação tecnológica em 1-2 gerações. Coincidência? Não.',
 'seed_user_15', (SELECT id FROM public."Topic" WHERE slug='capitalismo'), 0, 89,  76,  13,  0, NOW(), NOW()),

-- ARMAS (4)
('seed_arg_17', 'cidadao-armado-defende',
 'Cidadão armado se defende; cidadão desarmado é vítima',
 'Polícia chega depois. Em zona rural, chega muito depois — quando chega. Tirar do cidadão honesto a possibilidade de defender a família enquanto bandido segue armado é inverter o ônus da segurança. Direito à vida pressupõe direito à defesa eficaz.',
 'seed_user_13', (SELECT id FROM public."Topic" WHERE slug='armas'), 0, 178, 134, 44,  0, NOW(), NOW()),

('seed_arg_18', 'mais-armas-mais-homicidios',
 'Mais armas em circulação aumentam homicídios, dado é claro',
 'Meta-análises com dezenas de países mostram correlação forte entre densidade de armas por habitante e taxa de homicídios. EUA é o caso paradigmático no mundo desenvolvido. Brasil de 2018-2022 confirmou a tendência. Anedota de defesa pessoal não anula estatística.',
 'seed_user_14', (SELECT id FROM public."Topic" WHERE slug='armas'), 0, 156, 89,  67,  0, NOW(), NOW()),

('seed_arg_19', 'desarmamento-2003-funcionou',
 'Política de desarmamento de 2003 reduziu mortes, e os números provam',
 'Após o Estatuto do Desarmamento, a curva projetada de homicídios divergiu da real em centenas de milhares de vidas evitadas até 2014. Estudos do IPEA modelaram o contrafactual — não é militância, é econometria padrão.',
 'seed_user_10', (SELECT id FROM public."Topic" WHERE slug='armas'), 0, 134, 98,  36,  0, NOW(), NOW()),

('seed_arg_20', 'legitima-defesa-direito',
 'Direito à legítima defesa não pode ser monopólio do Estado',
 'O Estado falha em prover segurança no Brasil — basta olhar taxas de elucidação de homicídios. Cobrar do cidadão que confie cegamente num sistema que comprovadamente não funciona é cobrança ideológica, não pragmática.',
 'seed_user_01', (SELECT id FROM public."Topic" WHERE slug='armas'), 0, 102, 87,  15,  0, NOW(), NOW()),

-- VEGANISMO (4)
('seed_arg_21', 'pecuaria-insustentavel',
 'Pecuária é insustentável: comer carne é escolha ética obsoleta',
 'Pecuária ocupa ~30% das terras agricultáveis do planeta, é responsável por ~15% das emissões de gases de efeito estufa e usa volumes absurdos de água. Manter consumo de carne nos níveis atuais com 8 bilhões de habitantes é matematicamente impossível.',
 'seed_user_12', (SELECT id FROM public."Topic" WHERE slug='veganismo'), 0, 145, 167, -22, 0, NOW(), NOW()),

('seed_arg_22', 'veganismo-militante-pobreza',
 'Veganismo militante ignora realidade nutricional de populações pobres',
 'Cobrar dieta plant-based de quem sobrevive com R$ 600/mês é ignorar que arroz-feijão-ovo-frango é a base proteica acessível. Discurso ético sobre alimentação que não considera classe é veganismo de classe média performático.',
 'seed_user_08', (SELECT id FROM public."Topic" WHERE slug='veganismo'), 0, 178, 89,  89,  0, NOW(), NOW()),

('seed_arg_23', 'bem-estar-animal-regulacao',
 'Bem-estar animal não exige extinguir a pecuária, exige regulação séria',
 'Confinamento, abate doloroso, transporte cruel — tudo isso é regulável. Pecuária extensiva bem feita coexiste com pastagens biodiversas. Defender abolicionismo total ignora que humanos coevoluíram com domesticação animal há 10 mil anos.',
 'seed_user_11', (SELECT id FROM public."Topic" WHERE slug='veganismo'), 0, 89,  56,  33,  0, NOW(), NOW()),

('seed_arg_24', 'leite-ovos-sofrimento',
 'Leite e ovos da indústria envolvem sofrimento comparável ao da carne',
 'Vaca leiteira é forçada a partos sucessivos para manter lactação. Galinha poedeira vive em gaiolas de 600cm². Vegetariano que evita carne mas consome laticínios industriais não está fora do circuito de sofrimento — está em outro setor dele.',
 'seed_user_12', (SELECT id FROM public."Topic" WHERE slug='veganismo'), 0, 121, 34,  87,  0, NOW(), NOW()),

-- MUDANÇAS CLIMÁTICAS (4)
('seed_arg_25', 'negar-clima-fora-da-ciencia',
 'Negar mudanças climáticas em 2026 é estar fora da ciência',
 'O consenso entre climatologistas que publicam na área é acima de 97%. Não é mais debate científico — é debate político fantasiado de científico. Quem nega aquecimento antropogênico hoje está no mesmo lugar de quem negou tabaco-câncer nos anos 70.',
 'seed_user_04', (SELECT id FROM public."Topic" WHERE slug='mudancas-climaticas'), 0, 234, 56,  178, 0, NOW(), NOW()),

('seed_arg_26', 'nuclear-ponte-viavel',
 'Energia nuclear é a única ponte viável para zerar emissões',
 'Eólica e solar são intermitentes — exigem backup. Hidrelétrica esgotou seu potencial em países desenvolvidos. Nuclear de quarta geração é segura, densa em energia e zero-carbono. Aversão pós-Chernobyl está bloqueando a melhor ferramenta que temos.',
 'seed_user_15', (SELECT id FROM public."Topic" WHERE slug='mudancas-climaticas'), 0, 167, 98,  69,  0, NOW(), NOW()),

('seed_arg_27', 'carro-eletrico-litio',
 'Carro elétrico não é solução: lítio também devasta o meio ambiente',
 'Mineração de lítio consome água em regiões já secas (Atacama), e baterias têm vida útil curta com descarte problemático. Trocar combustão por elétrico individual é mover o problema, não resolvê-lo. Solução real é transporte coletivo, não consumo individual "verde".',
 'seed_user_08', (SELECT id FROM public."Topic" WHERE slug='mudancas-climaticas'), 0, 134, 67,  67,  0, NOW(), NOW()),

('seed_arg_28', 'paises-ricos-divida-climatica',
 'Países ricos têm dívida histórica com o Sul Global no clima',
 'EUA e Europa emitiram cumulativamente mais CO2 que todo o resto do mundo somado durante 150 anos de industrialização. Cobrar que Brasil, Índia e África parem de se desenvolver agora é privilegiar o status quo. Justiça climática exige financiamento, não sermão.',
 'seed_user_10', (SELECT id FROM public."Topic" WHERE slug='mudancas-climaticas'), 0, 198, 76,  122, 0, NOW(), NOW()),

-- IA (4)
('seed_arg_29', 'ia-vai-eliminar-empregos',
 'IA generativa vai eliminar mais empregos do que vai criar',
 'Diferente de revoluções anteriores, IA ataca trabalho cognitivo — onde estão os empregos de maior qualidade do século XX. Tradutor, designer júnior, copywriter, suporte técnico, analista contábil: tudo automatizável em 5 anos. Otimismo histórico não se aplica aqui.',
 'seed_user_11', (SELECT id FROM public."Topic" WHERE slug='ia'), 0, 156, 78,  78,  0, NOW(), NOW()),

('seed_arg_30', 'panico-ia-igual-internet-90',
 'Pânico com IA é o mesmo que tivemos com internet nos anos 90',
 'Em 1996 diziam que internet ia destruir o varejo, a imprensa e a escola. Destruiu alguns nichos, criou indústrias inteiras. IA vai seguir o mesmo padrão: deslocar tarefas, gerar novas funções, e em 10 anos pareceremos tolos por ter entrado em pânico.',
 'seed_user_03', (SELECT id FROM public."Topic" WHERE slug='ia'), 0, 112, 134, -22, 0, NOW(), NOW()),

('seed_arg_31', 'treinar-modelo-obra-alheia-roubo',
 'Treinar modelo com obra alheia sem autorização é roubo',
 'Big Tech raspou trilhões de palavras e bilhões de imagens sem licenciar nada. Quando autor individual pirateia uma música é processo — quando OpenAI pirateia bibliotecas inteiras é "uso justo". O dois pesos é evidente, e o judiciário americano começou a notar.',
 'seed_user_12', (SELECT id FROM public."Topic" WHERE slug='ia'), 0, 189, 67,  122, 0, NOW(), NOW()),

('seed_arg_32', 'regular-ia-trava-brasil',
 'Regulamentar IA agora trava o Brasil na corrida tecnológica',
 'União Europeia já se isolou da fronteira com o AI Act — empresas pararam de lançar produtos lá. Brasil copiar esse modelo é entregar mercado para EUA e China. Regulação madura vem depois do desenvolvimento, não antes.',
 'seed_user_15', (SELECT id FROM public."Topic" WHERE slug='ia'), 0, 78,  98,  -20, 0, NOW(), NOW()),

-- FEMINISMO (4)
('seed_arg_33', 'cotas-femininas-chefia',
 'Cotas femininas em cargos de chefia corrigem dívida histórica',
 'Sem ação afirmativa, a "evolução natural" leva décadas — e há séculos de desvantagem acumulada. Países nórdicos com cotas em conselhos viram representação chegar a 40%+ em 10 anos. Sem cota, ficaria em 15% para sempre.',
 'seed_user_10', (SELECT id FROM public."Topic" WHERE slug='feminismo'), 0, 145, 112, 33,  0, NOW(), NOW()),

('seed_arg_34', 'pauta-identitaria-esvaziou-classe',
 'Pauta identitária esvaziou o feminismo de classe',
 'Feminismo dos anos 60-70 falava de creche pública, salário, jornada. Hoje debate-se linguagem neutra enquanto trabalhadora doméstica segue sem direitos trabalhistas básicos. A pauta migrou da fábrica para o Twitter — e perdeu poder real.',
 'seed_user_10', (SELECT id FROM public."Topic" WHERE slug='feminismo'), 0, 134, 156, -22, 0, NOW(), NOW()),

('seed_arg_35', 'equiparacao-salarial-justica',
 'Equiparação salarial não é privilégio, é justiça básica',
 'Mesma função, mesma carga, mesma performance, salários diferentes por gênero: isso é ilegal desde 1943 no Brasil e segue acontecendo. Pedir cumprimento da lei não é demanda radical — é o mínimo civilizatório.',
 'seed_user_06', (SELECT id FROM public."Topic" WHERE slug='feminismo'), 0, 198, 45,  153, 0, NOW(), NOW()),

('seed_arg_36', 'feminismo-radical-trans',
 'Feminismo radical exclui mulheres trans e isso é incoerente',
 'Defender que "mulher é quem nasce mulher" replica exatamente o essencialismo biológico que o próprio feminismo combateu por décadas. Ou o gênero é construção social — e aí inclui trans — ou é destino biológico, e aí volta-se ao ponto anti-feminista de partida.',
 'seed_user_06', (SELECT id FROM public."Topic" WHERE slug='feminismo'), 0, 112, 98,  14,  0, NOW(), NOW()),

-- ATEÍSMO (2)
('seed_arg_37', 'moral-sem-deus-honesta',
 'Moral sem Deus é não só possível como mais honesta',
 'Quem age bem por medo de punição divina não está sendo moral — está sendo prudente. Moral genuína exige fazer o bem sem promessa de recompensa nem ameaça de castigo. Ateu que age eticamente faz por convicção, não por contrato cósmico.',
 'seed_user_02', (SELECT id FROM public."Topic" WHERE slug='ateismo'), 0, 167, 78,  89,  0, NOW(), NOW()),

('seed_arg_38', 'ateismo-militante-fe',
 'Ateísmo militante virou outra forma de fé',
 'Certeza absoluta de que não existe transcendência é tão dogmática quanto certeza absoluta de que existe. Ateísmo intelectualmente honesto é agnosticismo prático. Quem vira proselitista anti-religião só trocou a igreja pelo Reddit.',
 'seed_user_05', (SELECT id FROM public."Topic" WHERE slug='ateismo'), 0, 89,  121, -32, 0, NOW(), NOW()),

-- RELIGIÃO (2)
('seed_arg_39', 'estado-laico-nao-anti-religioso',
 'Estado laico não significa Estado anti-religioso',
 'Laicidade é neutralidade do Estado entre fés, não hostilidade contra elas. Crucifixo em tribunal? Pode incomodar. Mas proibir prefeito de citar a Bíblia em discurso pessoal é confundir laicidade com laicismo militante — coisas distintas no direito comparado.',
 'seed_user_09', (SELECT id FROM public."Topic" WHERE slug='religiao'), 0, 134, 67,  67,  0, NOW(), NOW()),

('seed_arg_40', 'ensino-religioso-inconstitucional',
 'Educação religiosa em escola pública fere a Constituição',
 'Art. 19 veda Estado de subvencionar culto. Ensino religioso confessional dentro de escola pública, com professor pago pelo erário, é exatamente isso. Aula sobre religiões (no plural, comparada, histórica) tudo bem — catequese disfarçada de educação, não.',
 'seed_user_02', (SELECT id FROM public."Topic" WHERE slug='religiao'), 0, 156, 89,  67,  0, NOW(), NOW())

ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- Verifica:
-- SELECT t.slug AS topico, COUNT(*) AS qtd
-- FROM public."Argument" a JOIN public."Topic" t ON t.id = a."topicId"
-- GROUP BY t.slug ORDER BY qtd DESC;
