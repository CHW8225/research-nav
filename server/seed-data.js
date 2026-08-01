// 从 yanweb.top 提取的初始数据
const categories = [
  { name: "搜索", icon: "fa-search", sort_order: 1 },
  { name: "置顶网页", icon: "fa-thumb-tack", sort_order: 2 },
  { name: "学术AI", icon: "fa-flask", sort_order: 3 },
  { name: "满血DeepSeek", icon: "fa-bolt", sort_order: 4 },
  { name: "AI智能体", icon: "fa-cogs", sort_order: 5 },
  { name: "论文写作", icon: "fa-pencil", sort_order: 6 },
  { name: "查重降重", icon: "fa-check-circle", sort_order: 7 },
  { name: "开题答辩", icon: "fa-desktop", sort_order: 8 },
  { name: "中文文献", icon: "fa-book", sort_order: 9 },
  { name: "英文文献", icon: "fa-file-text", sort_order: 10 },
  { name: "文献管理", icon: "fa-folder", sort_order: 11 },
  { name: "检索工具", icon: "fa-search-plus", sort_order: 12 },
  { name: "专利检索", icon: "fa-certificate", sort_order: 13 },
  { name: "期刊检索", icon: "fa-newspaper-o", sort_order: 14 },
  { name: "科研绘图", icon: "fa-paint-brush", sort_order: 15 },
  { name: "科研社区", icon: "fa-users", sort_order: 16 },
  { name: "知识服务", icon: "fa-lightbulb-o", sort_order: 17 },
  { name: "科研数据", icon: "fa-database", sort_order: 18 },
  { name: "数据查找", icon: "fa-table", sort_order: 19 },
  { name: "院校相关", icon: "fa-graduation-cap", sort_order: 20 },
  { name: "考公考编", icon: "fa-id-card", sort_order: 21 },
  { name: "求职就业", icon: "fa-briefcase", sort_order: 22 },
  { name: "摸鱼神器", icon: "fa-gamepad", sort_order: 23 }
];

const links = [
  // 搜索
  { title: "必应搜索", url: "https://www.bing.com", category: "搜索", icon: "", description: "微软必应搜索" },
  { title: "谷歌学术", url: "https://scholar.google.com", category: "搜索", icon: "https://yanweb.top/assets/img/svg/googlescholar.png", description: "Google学术搜索" },
  { title: "万方学术", url: "https://www.wanfangdata.com.cn", category: "搜索", icon: "", description: "万方数据知识服务平台" },
  { title: "百度学术", url: "https://xueshu.baidu.com", category: "搜索", icon: "", description: "百度学术搜索" },
  { title: "X-MOL学术", url: "https://www.x-mol.com", category: "搜索", icon: "https://yanweb.top/assets/img/svg/x-mol.png", description: "X-MOL学术平台" },
  { title: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov", category: "搜索", icon: "", description: "医学文献检索服务系统" },
  { title: "专利检索", url: "https://pss-system.cponline.cnipa.gov.cn", category: "搜索", icon: "", description: "国家知识产权局专利检索" },
  { title: "在线翻译", url: "https://fanyi.baidu.com", category: "搜索", icon: "", description: "百度在线翻译" },

  // 置顶网页
  { title: "文献翻译", url: "https://www.scholaread.cn", category: "置顶网页", icon: "https://cdn.scholaread.cn/assets/web/2025-09-15/cn/favicon.ico", description: "专业文献翻译工具", is_pinned: 1 },
  { title: "论文AI自动生成", url: "https://www.ibiling.cn", category: "置顶网页", icon: "https://yanweb.top/assets/img/svg/ibiling.png", description: "AI论文自动生成工具", is_pinned: 1 },
  { title: "Ai论文生成(专业版)", url: "https://www.aibiye.com", category: "置顶网页", icon: "https://yanweb.top/assets/img/svg/aibiye.jpg", description: "专业版AI论文生成", is_pinned: 1 },
  { title: "比目鱼英文论文写作", url: "https://www.bmysci.com", category: "置顶网页", icon: "https://www.bmysci.com/bmy_2.ico", description: "英文论文写作助手", is_pinned: 1 },
  { title: "维普AI综述生成", url: "https://xueshu.cqvip.com", category: "置顶网页", icon: "", description: "维普AI综述生成", is_pinned: 1 },
  { title: "科研图片查重", url: "https://www.imagetwin.ai", category: "置顶网页", icon: "https://yanweb.top/assets/img/svg/imagetwin.jpg", description: "科研图片查重工具", is_pinned: 1 },
  { title: "PaperFake降重降AI", url: "https://www.paperfake.cn", category: "置顶网页", icon: "https://yanweb.top/assets/img/svg/paperfake2.png", description: "论文降重降AI检测", is_pinned: 1 },
  { title: "小绿鲸文献阅读器", url: "https://www.xljsci.com", category: "置顶网页", icon: "https://www.xljsci.com/favicon.ico", description: "专业文献阅读器", is_pinned: 1 },
  { title: "AI一键论文生成", url: "https://www.aipaper.cn", category: "置顶网页", icon: "", description: "AI一键生成论文", is_pinned: 1 },
  { title: "茅茅虫论文写作", url: "https://www.maimaichong.com", category: "置顶网页", icon: "https://yanweb.top/assets/img/svg/mymmc.png", description: "茅茅虫论文写作", is_pinned: 1 },
  { title: "星火科研助手", url: "https://xinghuo.xfyun.cn", category: "置顶网页", icon: "https://yanweb.top/assets/img/svg/spark-icon.png", description: "讯飞星火科研助手", is_pinned: 1 },
  { title: "SCI-Hub论文下载", url: "https://sci-hub.se", category: "置顶网页", icon: "", description: "SCI-Hub论文下载", is_pinned: 1 },

  // 学术AI
  { title: "AI论文一键生成", url: "https://www.ibiling.cn", category: "学术AI", icon: "https://yanweb.top/assets/img/svg/ibiling2.png", description: "AI论文一键生成" },
  { title: "免费 AI 写作", url: "https://www.aipaper.cn", category: "学术AI", icon: "", description: "免费AI写作工具" },
  { title: "AiPy (本地Manus)", url: "https://www.aipyaipy.com", category: "学术AI", icon: "https://www.aipyaipy.com/image/logo.webp", description: "本地部署Manus" },
  { title: "AI英文论文润色", url: "https://www.editage.cn", category: "学术AI", icon: "https://yanweb.top/assets/img/svg/editage.jpg", description: "专业英文论文润色" },
  { title: "讯飞AI写作", url: "https://huixie.xfyun.cn", category: "学术AI", icon: "https://yanweb.top/assets/img/svg/huiwen.png", description: "讯飞AI写作平台" },
  { title: "GPT Academic", url: "https://auth.gptacademic.cn", category: "学术AI", icon: "https://auth.gptacademic.cn/favicon.ico", description: "GPT学术版" },

  // 满血DeepSeek
  { title: "Flowith(GPT-5)", url: "https://flowith.net", category: "满血DeepSeek", icon: "https://flowith.net/favicon.ico", description: "Flowith AI助手" },
  { title: "讯飞星火AI", url: "https://xinghuo.xfyun.cn", category: "满血DeepSeek", icon: "https://yanweb.top/assets/img/svg/spark-icon.png", description: "讯飞星火AI" },
  { title: "学术版DeepSeek", url: "https://www.deepseek.com", category: "满血DeepSeek", icon: "https://yanweb.top/assets/img/svg/supercqvip.jpg", description: "学术版DeepSeek" },
  { title: "DeepSeek官方", url: "https://www.deepseek.com", category: "满血DeepSeek", icon: "https://yanweb.top/assets/img/svg/deepseek.jpg", description: "DeepSeek官方" },
  { title: "腾讯元宝", url: "https://yuanbao.tencent.com", category: "满血DeepSeek", icon: "https://yanweb.top/assets/img/svg/yuanbao.png", description: "腾讯元宝AI" },
  { title: "华为小艺", url: "https://xiaoyi.huawei.com", category: "满血DeepSeek", icon: "https://yanweb.top/assets/img/svg/xiaoyi.png", description: "华为小艺助手" },

  // AI智能体
  { title: "讯飞AI智能体", url: "https://agent.xfyun.cn", category: "AI智能体", icon: "https://agent.xfyun.cn/agent-icon.ico", description: "讯飞AI智能体" },
  { title: "扣子-报告秒出", url: "https://www.coze.cn", category: "AI智能体", icon: "https://yanweb.top/assets/img/svg/coze.jpg", description: "扣子AI智能体" },
  { title: "TRAE AI编程", url: "https://www.trae.ai", category: "AI智能体", icon: "https://yanweb.top/assets/img/svg/trae.png", description: "AI编程助手" },
  { title: "堆友AI工具箱", url: "https://www.duiyou.ai", category: "AI智能体", icon: "https://yanweb.top/assets/img/svg/duiyou.jpg", description: "堆友AI工具箱" },
  { title: "AI数字人视频", url: "https://www.keevx.com", category: "AI智能体", icon: "https://yanweb.top/assets/img/svg/keevx.png", description: "AI数字人视频生成" },
  { title: "码上飞(AI写代码)", url: "https://www.codeflying.ai", category: "AI智能体", icon: "https://yanweb.top/assets/img/svg/codeflying.png", description: "AI代码生成" },

  // 论文写作
  { title: "Ai论文(专业版)", url: "https://www.aibiye.com", category: "论文写作", icon: "https://yanweb.top/assets/img/svg/aibiye1.jpg", description: "专业版AI论文" },
  { title: "笔灵AI降重", url: "https://www.biling.ai", category: "论文写作", icon: "https://yanweb.top/assets/img/svg/biling4.png", description: "笔灵AI降重" },
  { title: "茅茅虫论文写作", url: "https://www.maimaichong.com", category: "论文写作", icon: "https://yanweb.top/assets/img/svg/mymmc.png", description: "茅茅虫论文写作" },
  { title: "AICheck", url: "https://www.aicheck.cn", category: "论文写作", icon: "https://yanweb.top/assets/img/svg/论文.png", description: "AICheck论文检测" },
  { title: "塞特新斯写作", url: "https://www.citexs.com", category: "论文写作", icon: "https://yanweb.top/assets/img/svg/citexs.png", description: "塞特新斯写作" },
  { title: "AI办公写作", url: "https://www.wenshu.ai", category: "论文写作", icon: "https://yanweb.top/assets/img/svg/wenshu.jpg", description: "AI办公写作" },
  { title: "蛙蛙写作", url: "https://www.wwxie.com", category: "论文写作", icon: "https://yanweb.top/assets/img/svg/wawa.png", description: "蛙蛙写作" },

  // 查重降重
  { title: "iThenticate查重", url: "https://www.ithenticate.com", category: "查重降重", icon: "https://yanweb.top/assets/img/svg/iThenticate.png", description: "国际权威查重系统" },
  { title: "PaperYY免费查重", url: "https://www.paperyy.com", category: "查重降重", icon: "https://www.paperyy.com/static/favicon.ico", description: "免费论文查重" },
  { title: "万方查重", url: "https://wanfangcheck.cn", category: "查重降重", icon: "", description: "万方论文查重" },
  { title: "paper880查重", url: "https://www.paper880.com", category: "查重降重", icon: "https://www.paper880.com/favicon.ico", description: "paper880查重" },
  { title: "PaperFake查重", url: "https://www.paperfake.cn", category: "查重降重", icon: "https://yanweb.top/assets/img/svg/paperfake2.png", description: "PaperFake查重" },
  { title: "茅茅虫论文降重", url: "https://www.maimaichong.com", category: "查重降重", icon: "https://yanweb.top/assets/img/svg/mymmc.png", description: "茅茅虫降重" },
  { title: "快降重", url: "https://www.kuaijiangchong.com.cn", category: "查重降重", icon: "https://www.kuaijiangchong.com.cn/favicon.png", description: "快速降重" },

  // 开题答辩
  { title: "笔格AI PPT", url: "https://www.bigeppt.com", category: "开题答辩", icon: "https://yanweb.top/assets/img/svg/bigeppt.png", description: "AI生成PPT" },
  { title: "AI生成答辩PPT", url: "https://www.maimaichong.com", category: "开题答辩", icon: "https://yanweb.top/assets/img/svg/mymmc.png", description: "AI生成答辩PPT" },
  { title: "AI PPT", url: "https://www.aippt.cn", category: "开题答辩", icon: "https://yanweb.top/assets/img/svg/aippt.png", description: "AI PPT生成" },
  { title: "GAIPPT", url: "https://www.gaippt.com", category: "开题答辩", icon: "https://www.gaippt.com/assets/favicon-CVbMNAt6.ico", description: "GAIPPT生成" },
  { title: "PPT超级市场", url: "https://www.pptsupermarket.com", category: "开题答辩", icon: "https://www.pptsupermarket.com/favicon.ico", description: "PPT模板下载" },

  // 中文文献
  { title: "PubScholar", url: "https://pubscholar.cn", category: "中文文献", icon: "https://yanweb.top/assets/img/svg/cas.png", description: "中科院PubScholar" },
  { title: "万方", url: "https://www.wanfangdata.com.cn", category: "中文文献", icon: "", description: "万方数据" },
  { title: "维普期刊", url: "https://qikan.cqvip.com", category: "中文文献", icon: "", description: "维普期刊" },
  { title: "科学文库", url: "https://book.sciencereading.cn", category: "中文文献", icon: "", description: "科学文库" },
  { title: "知网", url: "https://www.cnki.net", category: "中文文献", icon: "", description: "中国知网" },
  { title: "ChinaXiv", url: "http://www.chinaxiv.org", category: "中文文献", icon: "https://yanweb.top/assets/img/svg/chinaxiv.png", description: "中国预印本服务系统" },
  { title: "超星期刊", url: "https://qikan.chaoxing.com", category: "中文文献", icon: "", description: "超星期刊" },
  { title: "博看期刊", url: "http://www.bookan.com.cn", category: "中文文献", icon: "https://yanweb.top/assets/img/svg/bokan.png", description: "博看期刊" },

  // 英文文献
  { title: "Web of Science", url: "https://www.webofscience.com", category: "英文文献", icon: "", description: "Web of Science" },
  { title: "Nature", url: "https://www.nature.com", category: "英文文献", icon: "https://yanweb.top/assets/img/svg/nature.png", description: "Nature期刊" },
  { title: "Science", url: "https://www.science.org", category: "英文文献", icon: "https://yanweb.top/assets/img/svg/science.png", description: "Science期刊" },
  { title: "Cell", url: "https://www.cell.com", category: "英文文献", icon: "https://yanweb.top/assets/img/svg/cell.png", description: "Cell期刊" },
  { title: "ScienceDirect", url: "https://www.sciencedirect.com", category: "英文文献", icon: "https://yanweb.top/assets/img/svg/sciencedirect.png", description: "ScienceDirect" },
  { title: "Wiley", url: "https://onlinelibrary.wiley.com", category: "英文文献", icon: "https://yanweb.top/assets/img/svg/wiley.png", description: "Wiley在线图书馆" },
  { title: "IEEE", url: "https://ieeexplore.ieee.org", category: "英文文献", icon: "https://yanweb.top/assets/img/svg/ieee.png", description: "IEEE Xplore" },
  { title: "Springer", url: "https://link.springer.com", category: "英文文献", icon: "https://yanweb.top/assets/img/svg/springer.png", description: "Springer期刊" },
  { title: "arXiv", url: "https://arxiv.org", category: "英文文献", icon: "https://yanweb.top/assets/img/svg/arxiv.png", description: "arXiv预印本" },

  // 文献管理
  { title: "小绿鲸英文文献阅读器", url: "https://www.xljsci.com", category: "文献管理", icon: "https://www.xljsci.com/favicon.ico", description: "专业英文文献阅读器" },
  { title: "UPDF文献阅读器", url: "https://updf.cn", category: "文献管理", icon: "https://yanweb.top/assets/img/svg/updf.png", description: "UPDF阅读器" },
  { title: "Zotero", url: "https://www.zotero.org", category: "文献管理", icon: "https://yanweb.top/assets/img/svg/zotero.png", description: "Zotero文献管理" },
  { title: "Zotero中文社区", url: "https://www.zotero-china.com", category: "文献管理", icon: "https://yanweb.top/assets/img/svg/zotero.png", description: "Zotero中文社区" },
  { title: "EndNote", url: "https://endnote.com", category: "文献管理", icon: "https://yanweb.top/assets/img/svg/endnote.png", description: "EndNote文献管理" },
  { title: "Mendeley", url: "https://www.mendeley.com", category: "文献管理", icon: "https://yanweb.top/assets/img/svg/mendeley.png", description: "Mendeley文献管理" },
  { title: "NoteExpress", url: "https://www.neinote.com", category: "文献管理", icon: "https://yanweb.top/assets/img/svg/inoteexpress.png", description: "NoteExpress" },
  { title: "知网研学", url: "https://x.cnki.net", category: "文献管理", icon: "https://yanweb.top/assets/img/svg/estudy.png", description: "知网研学平台" },

  // 检索工具
  { title: "百维智搜", url: "https://www.bewisearch.com", category: "检索工具", icon: "", description: "百维智搜" },
  { title: "X-MOL", url: "https://www.x-mol.com", category: "检索工具", icon: "https://yanweb.top/assets/img/svg/x-mol.png", description: "X-MOL学术平台" },
  { title: "赛特新斯", url: "https://www.citexs.com", category: "检索工具", icon: "https://yanweb.top/assets/img/svg/citexs.png", description: "赛特新斯" },
  { title: "Aminer", url: "https://www.aminer.cn", category: "检索工具", icon: "https://yanweb.top/assets/img/svg/aminer.png", description: "Aminer学术搜索" },

  // 专利检索
  { title: "AI专利检索", url: "https://pss-system.cponline.cnipa.gov.cn", category: "专利检索", icon: "", description: "AI专利检索" },
  { title: "专利检索", url: "https://pss-system.cponline.cnipa.gov.cn", category: "专利检索", icon: "", description: "国家知识产权局" },
  { title: "专利之星检索", url: "https://www.patentstar.com.cn", category: "专利检索", icon: "https://yanweb.top/assets/img/svg/patentstar.png", description: "专利之星检索" },
  { title: "SooPAT专利搜索", url: "https://www.soopat.com", category: "专利检索", icon: "https://yanweb.top/assets/img/svg/soopat.png", description: "SooPAT专利搜索" },

  // 期刊检索
  { title: "维普期刊查证", url: "https://qikan.cqvip.com", category: "期刊检索", icon: "", description: "维普期刊查证" },
  { title: "JCR分区", url: "https://jcr.clarivate.com", category: "期刊检索", icon: "", description: "JCR期刊分区" },
  { title: "期刊分区表", url: "https://www.fenqubiao.com", category: "期刊检索", icon: "https://yanweb.top/assets/img/svg/qkfqb.png", description: "中科院期刊分区表" },
  { title: "北大期刊网", url: "https://www.pkujournal.com", category: "期刊检索", icon: "https://yanweb.top/assets/img/svg/bdqk.jpg", description: "北大核心期刊" },

  // 科研绘图
  { title: "科研绘图素材库", url: "https://www.figdraw.com", category: "科研绘图", icon: "", description: "科研绘图素材库" },
  { title: "Origin绘图", url: "https://www.originlab.com", category: "科研绘图", icon: "https://www.originlab.com/favicon.ico", description: "Origin绘图软件" },
  { title: "ProcessOn思维导图", url: "https://www.processon.com", category: "科研绘图", icon: "https://www.processon.com/favicon.ico", description: "ProcessOn思维导图" },
  { title: "万兴绘图", url: "https://www.edrawsoft.cn", category: "科研绘图", icon: "https://images.edrawsoft.com/favicon.ico", description: "万兴绘图" },
  { title: "CNS绘图", url: "https://cnsknowall.com", category: "科研绘图", icon: "https://cnsknowall.com/favicon.ico", description: "CNS绘图" },

  // 科研社区
  { title: "科���网", url: "https://www.sciencenet.cn", category: "科研社区", icon: "https://yanweb.top/assets/img/svg/sciencenet.png", description: "科学网" },
  { title: "ResearchGate", url: "https://www.researchgate.net", category: "科研社区", icon: "https://yanweb.top/assets/img/svg/researchgate.png", description: "ResearchGate学术社交" },
  { title: "小木虫", url: "https://www.muchong.com", category: "科研社区", icon: "https://yanweb.top/assets/img/svg/muchong.png", description: "小木虫论坛" },
  { title: "丁香园社区", url: "https://www.dxy.cn", category: "科研社区", icon: "https://yanweb.top/assets/img/svg/dxy.png", description: "丁香园医学社区" },
  { title: "X-MOL问答", url: "https://www.x-mol.com", category: "科研社区", icon: "https://yanweb.top/assets/img/svg/x-mol.png", description: "X-MOL学术问答" },

  // 知识服务
  { title: "中国科技工程知识中心", url: "https://www.ckcest.cn", category: "知识服务", icon: "https://www.ckcest.cn/entry/favicon.ico", description: "中国科技工程知识中心" },
  { title: "医药卫生知识", url: "https://www.cma.org.cn", category: "知识服务", icon: "", description: "医药卫生知识" },
  { title: "海洋专业知识", url: "https://www.nmemc.org.cn", category: "知识服务", icon: "", description: "海洋专业知识" },
  { title: "气象科学专业知识", url: "https://www.cma.gov.cn", category: "知识服务", icon: "", description: "气象科学专业知识" },
  { title: "能源专业知识", url: "https://www.nea.gov.cn", category: "知识服务", icon: "", description: "能源专业知识" },
  { title: "农业学术服务平台", url: "https://www.agriservice.cn", category: "知识服务", icon: "", description: "农业学术服务平台" },

  // 科研数据
  { title: "中科院科学数据中心", url: "https://www.casdc.cn", category: "科研数据", icon: "https://www.casdc.cn/api/banaer_icoLogo/1050646620c24b9f8a3563716d4151b9.png", description: "中科院科学数据中心" },
  { title: "科技资源共享网", url: "https://escience.org.cn", category: "科研数据", icon: "https://escience.org.cn/favicon.ico", description: "国家科技资源共享网" },
  { title: "农业科学数据中心", url: "https://www.agridata.cn", category: "科研数据", icon: "https://www.agridata.cn/favicon.ico", description: "农业科学数据中心" },
  { title: "高能物理科学数据中心", url: "https://www.ihep.cas.cn", category: "科研数据", icon: "", description: "高能物理科学数据中心" },
  { title: "微生物科学数据中心", url: "https://www.im.cas.cn", category: "科研数据", icon: "", description: "微生物科学数据中心" },
  { title: "天文科学数据中心", url: "https://nadc.china-vo.org", category: "科研数据", icon: "https://nadc.china-vo.org/u/favicon.ico", description: "天文科学数据中心" },
  { title: "气象科学数据中心", url: "https://data.cma.cn", category: "科研数据", icon: "", description: "气象科学数据中心" },

  // 数据查找
  { title: "国家数据", url: "https://data.stats.gov.cn", category: "数据查找", icon: "https://yanweb.top/assets/img/svg/stats.png", description: "国家统计数据" },
  { title: "国家统计局", url: "https://www.stats.gov.cn", category: "数据查找", icon: "https://yanweb.top/assets/img/svg/statsgov.png", description: "国家统计局" },
  { title: "互联网信息中心", url: "https://www.cnnic.cn", category: "数据查找", icon: "https://yanweb.top/assets/img/svg/cnnic.png", description: "中国互联网信息中心" },
  { title: "前瞻数据库", url: "https://www.qianzhan.com", category: "数据查找", icon: "https://yanweb.top/assets/img/svg/qianzhan.png", description: "前瞻产业研究院" },
  { title: "CnOpenData", url: "https://www.cnopendata.com", category: "数据查找", icon: "https://yanweb.top/assets/img/svg/cnopendata.png", description: "CnOpenData" },
  { title: "法律法规", url: "https://flk.npc.gov.cn", category: "数据查找", icon: "https://yanweb.top/assets/img/svg/flk.png", description: "国家法律法规数据库" },
  { title: "东方财富书籍", url: "https://data.eastmoney.com", category: "数据查找", icon: "https://yanweb.top/assets/img/svg/eastmoney.png", description: "东方财富数据" },
  { title: "同花顺数据", url: "https://data.10jqka.com.cn", category: "数据查找", icon: "https://yanweb.top/assets/img/svg/10jqka.png", description: "同花顺数据" },

  // 院校相关
  { title: "院校库", url: "https://gaokao.chsi.com.cn", category: "院校相关", icon: "https://yanweb.top/assets/img/svg/chsi.png", description: "阳光高考院校库" },
  { title: "专业知识库", url: "https://gaokao.chsi.com.cn", category: "院校相关", icon: "https://yanweb.top/assets/img/svg/chsi.png", description: "专业知识库" },
  { title: "青塔数据", url: "https://www.cingta.com", category: "院校相关", icon: "https://yanweb.top/assets/img/svg/cingta.png", description: "青塔数据" },
  { title: "软科排名", url: "https://www.shanghairanking.com", category: "院校相关", icon: "https://yanweb.top/assets/img/svg/ruanke.png", description: "软科中国大学排名" },
  { title: "中国大学排行榜", url: "https://www.cnur.com", category: "院校相关", icon: "https://yanweb.top/assets/img/svg/cnur.png", description: "中国大学排行榜" },
  { title: "世界大学排名", url: "https://www.qschina.cn", category: "院校相关", icon: "https://yanweb.top/assets/img/svg/qs.png", description: "QS世界大学排名" },
  { title: "国家社科基金", url: "https://www.npopss-cn.gov.cn", category: "院校相关", icon: "https://yanweb.top/assets/img/svg/skygb.png", description: "国家社科基金" },
  { title: "国科基金大数据", url: "https://fund.nsfc.gov.cn", category: "院校相关", icon: "https://yanweb.top/assets/img/svg/kdnsfc.png", description: "国家自然科学基金" },

  // 考公考编
  { title: "国家公务员局", url: "http://www.scs.gov.cn", category: "考公考编", icon: "https://yanweb.top/assets/img/svg/gwy.png", description: "国家公务员局" },
  { title: "中国人事考试网", url: "http://www.cpta.com.cn", category: "考公考编", icon: "https://yanweb.top/assets/img/svg/cpta.png", description: "中国人事考试网" },
  { title: "粉笔", url: "https://fenbi.com", category: "考公考编", icon: "https://nodestatic.fbstatic.cn/weblts_spa_online/page/assets/fenbi32.ico", description: "粉笔公考" },
  { title: "华图", url: "https://huatu.com", category: "考公考编", icon: "https://www.huatu.com/favicon.ico", description: "华图教育" },
  { title: "中公", url: "https://www.offcn.com", category: "考公考编", icon: "https://www.eoffcn.com/favicon.ico", description: "中公教育" },
  { title: "高顿", url: "https://www.gaodun.com", category: "考公考编", icon: "https://www.gaodun.com/favicon.ico", description: "高顿教育" },
  { title: "公开真题库", url: "https://www.gkzenti.cn", category: "考公考编", icon: "https://www.gkzenti.cn/favicon.ico", description: "公开真题库" },

  // 求职就业
  { title: "就业服务平台", url: "https://www.ncss.cn", category: "求职就业", icon: "https://t3.chei.com.cn/ncss/favicon.ico", description: "国家大学生就业服务平台" },
  { title: "公共招聘网", url: "https://job.mohrss.gov.cn", category: "求职就业", icon: "", description: "中国公共招聘网" },
  { title: "学术桥", url: "https://www.acabridge.cn", category: "求职就业", icon: "", description: "学术桥" },
  { title: "高校人才网", url: "https://www.gxrcw.com", category: "求职就业", icon: "", description: "高校人才网" },
  { title: "智联招聘", url: "https://www.zhaopin.com", category: "求职就业", icon: "", description: "智联招聘" },
  { title: "BOSS直聘", url: "https://www.zhipin.com", category: "求职就业", icon: "https://static.zhipin.com/favicon.ico", description: "BOSS直聘" },
  { title: "猎聘", url: "https://www.liepin.com", category: "求职就业", icon: "https://concat.lietou-static.com/fe-www-pc/v6/static/images/favicon.e6edbc00.ico", description: "猎聘" },

  // 摸鱼神器
  { title: "情感树洞", url: "https://www.treehole.cn", category: "摸鱼神器", icon: "", description: "情感树洞" },
  { title: "潮汐", url: "https://tide.fm", category: "摸鱼神器", icon: "https://tide.fm/img/logo-4b3b1b16be.png", description: "潮汐白噪音" },
  { title: "音乐平台", url: "https://music.163.com", category: "摸鱼神器", icon: "", description: "网易云音乐" },
  { title: "今日热榜", url: "https://rebang.today", category: "摸鱼神器", icon: "https://rebang.today/favicon.ico", description: "今日热榜" },
  { title: "今天吃什么", url: "https://www.chichichi.me", category: "摸鱼神器", icon: "", description: "今天吃什么" },
  { title: "放个烟花", url: "https://www.fireworks.cn", category: "摸鱼神器", icon: "", description: "放个烟花" },
  { title: "2048小游戏", url: "https://2048game.com", category: "摸鱼神器", icon: "https://yanweb.top/assets/img/svg/2048.png", description: "2048游戏" },
  { title: "五子棋", url: "https://www.gomokuarena.com", category: "摸鱼神器", icon: "", description: "五子棋" },
  { title: "俄罗斯方块", url: "https://www.tetrisgame.org", category: "摸鱼神器", icon: "", description: "俄罗斯方块" },
  { title: "4399小游戏", url: "https://www.4399.com", category: "摸鱼神器", icon: "https://www.4399.com/favicon.ico", description: "4399小游戏" },
  { title: "每日必应壁纸", url: "https://dailybing.com", category: "摸鱼神器", icon: "https://dailybing.com/favicon.png", description: "每日必应壁纸" }
];

module.exports = {
  categories,
  links
};
