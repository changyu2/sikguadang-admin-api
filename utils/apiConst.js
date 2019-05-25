module.exports = {
  authTokenHeader: 'x-sikguadang-admin-token',
  restoreTokenHeader: 'x-sikguadang-admin-restore',
  defaultProfilePhotoUrl: 'd000/default_profile_photo.jpg',
  delimiter: {
    colon: ':',
    underscore: '_',
    slash: '/',
    asterisk: '*',
    comma: ',',
    dot: '.'
  },
  redis: {
    key: {
      contentCache: 'content_cache',
      contentCount: 'content_count',
      buzzvilCache: 'buzzvil_cache'
    },
    hashKey: {
      view: 'view',
      comment: 'comment',
      like: 'like'
    },
    expire: {
      contentCacheExpireSec: 600,
      userAuthExpireSec: 604800,
      buzzvilCacheExpireSec: 3600
    }
  },
  status: {
    ing: 'ing',
    active: 'actv',
    hold: 'hold',
    delete: 'del'
  },
  userType: {
    author: 'author',
    editor: 'editor',
    normal: 'normal'
  },
  noticeType: {
    shipping: 'shipping',
    product: 'product',
    event: 'event',
    etc: 'etc'
  },
  storyType: {
    drawing: 'drawing',
    wallpaper: 'wallpaper',
    photo: 'photo'
  },
  contentType: {
    story: 'story'
  },
  cardType: {
    image: 'image',
    youtube: 'youtube',
    imagelink: 'imagelink'
  },
  fileMetaCode: {
    advertisement: 'a000',
    default: 'd000',
    etc: 'e000',
    image: 'i000',
    imagelink: 'l000',
    thumbnail: 't000',
    shareThumbnail: 's000',
    bannerImage: 'b000',
    mainFeedImage: 'f000',
    temp: 'temp'
  },
  collectionName: {
    user: 'users',
    content: 'content',
    card: 'cards',
    advertisement: 'advertisements',
    greeting: 'greeting',
    image: 'images',
    notice: 'notices',
    store: 'stores',
    article: 'articles',
    banner: 'banners',
    mainFeed: 'mainFeeds'
  },
  email: {
    address: {
      noreply: 'noreply@fave.land'
    },
    subject: {
      auth: 'FAVE에 가입해 주셔서 감사합니다. 이메일 인증을 완료해주세요.'
    },
    html: {
      auth:
        "<!DOCTYPE html><html style=\"font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', 'Helvetica', Helvetica, dotum, sans-serif; font-size: 100%; line-height: 1.6em; margin: 0; padding: 0;\"><head><meta name=\"viewport\" content=\"width=device-width\"><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"><title>FAVE</title></head><body bgcolor=\"#fefefe\" style=\"font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', 'Helvetica', Helvetica, dotum, sans-serif; font-size: 100%; line-height: 1.6em; -webkit-font-smoothing: antialiased; height: 100%; -webkit-text-size-adjust: none; width: 100% !important; margin: 0; padding: 0;\"><table class=\"body-wrap\" bgcolor=\"#fefefe\" style=\"font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', 'Helvetica', Helvetica, dotum, sans-serif; font-size: 100%; line-height: 1.6em; width: 100%; margin: 0; padding: 0;\"><tr style=\"font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', 'Helvetica', Helvetica, dotum, sans-serif; font-size: 100%; line-height: 1.6em; margin: 0; padding: 0;\"><td style=\"font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', 'Helvetica', Helvetica, dotum, sans-serif; font-size: 100%; line-height: 1.6em; margin: 0; padding: 0;\"></td> <td class=\"container\" bgcolor=\"#FFFFFF\" style=\"font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', 'Helvetica', Helvetica, dotum, sans-serif; font-size: 100%; line-height: 1.6em; clear: both !important; display: block !important; max-width: 600px !important; Margin: 0 auto; padding: 20px;\"> <table style=\"\"> <tr> <td> <img style=\"width: 75px;\" src=\"https://cdna.fave.land/etc0/mail_logo.png\" /> </td> </tr> </table> <div class=\"content\" style=\"font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', 'Helvetica', Helvetica, dotum, sans-serif; font-size: 100%; line-height: 1.6em; display: block; max-width: 600px; margin: 0 auto; padding: 20px; border-left: 2px solid #494949; border-right: 2px solid #494949; border-top: 2px solid #494949; box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box;\"> <table style=\"font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', 'Helvetica', Helvetica, dotum, sans-serif; font-size: 100%; line-height: 1.6em; width: 100%; margin: 0; padding: 0;\"><tr style=\"font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', 'Helvetica', Helvetica, dotum, sans-serif; font-size: 100%; line-height: 1.6em; margin: 0; padding: 0;\"><td style=\"font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', 'Helvetica', Helvetica, dotum, sans-serif; font-size: 100%; line-height: 1.6em; margin: 0; padding: 0;\"> <p style=\"font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', 'Helvetica', Helvetica, dotum, sans-serif; font-size: 14px; line-height: 1.6em; font-weight: normal; margin: 0 0 10px; padding: 0;\"></p> <p style=\"font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', 'Helvetica', Helvetica, dotum, sans-serif; font-size: 14px; line-height: 1.6em; font-weight: normal; margin: 0 0 10px; padding: 0;\"></p> <h1 style=\"display: inline-block; font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 24px; line-height: 1.2em; color: #494949; font-weight: 600; margin: 40px 0 10px; padding: 0;\">FAVE</h1> <h1 style=\"display:inline-block ;font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 24px; line-height: 1.2em; color: #727272; font-weight: 600; margin: 40px 0 10px; padding: 0;\"> 인증메일입니다.</h1> <img style=\"width: 50px; display: inline-block;\" src=\"https://cdna.fave.land/etc0/mail_icon.png\" /> <h2 style=\"font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; line-height: 1.4em; color: #494949; font-weight: 200; margin: 40px 0 10px; padding: 0;\">안녕하세요, FAVE입니다.<br/>본 메일은 <b>FAVE 회원 가입 인증</b>을 위해 발송되는 확인 메일입니다.</h2> <h2 style=\"font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; line-height: 1.4em; color: #494949; font-weight: 200; margin: 40px 0 10px; padding: 0;\"><b>아래의 버튼을 클릭하신 후, 본인 인증 절차를 진행해주시길 바랍니다.</b></h2> <table class=\"btn-primary\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', 'Helvetica', Helvetica, dotum, sans-serif; font-size: 100%; line-height: 1.6em; width: auto !important; Margin: 40px 0; padding: 0;\"><tr style=\"font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', 'Helvetica', Helvetica, dotum, sans-serif; font-size: 100%; line-height: 1.6em; margin: 0; padding: 0;\"><td style=\"font-family: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 14px; line-height: 1.6em; text-align: center; vertical-align: top; margin: 0; padding: 0;\" align=\"center valign=\"top\"> <a href=\"faveemailauthlink\" style=\"font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', 'Helvetica', Helvetica, dotum, sans-serif; font-size: 14px; line-height: 2; color: #494949; display: inline-block; cursor: pointer; font-weight: bold; text-decoration: none; background: #ffffff; margin: 0; padding: 5px 15px; border-color: #494949; border-style: solid; border-width: 2px;\">메일 인증하기</a> </td> </tr></table> </td> </tr></table></div><img style=\"width: 100%; max-width:600px;\" src=\"https://cdna.fave.land/etc0/mail_banner.jpg\" /> </td> <td style=\"font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Helvetica Neue', 'Helvetica', Helvetica, dotum, sans-serif; font-size: 100%; line-height: 1.6em; margin: 0; padding: 0;\"></td> </tr></table></body></html>"
    },
    authLink: 'https://fave.land/auth/'
  },
  regex: {
    userNameReg: /^[\u3131-\u314E\u314F-\u3163\uAC00-\uD7A3_\w]*$/g
  },
  userNameMaxSize: 15,
  commentMaxSize: 200,
  receiverTokenHeader: 'x-fave-receiver-token',
  buzzvilToken:
    '4ba08832396089a55ad4a36ee775dfee3448388ceed5a7e97171158821ff9516',
  buzzvilProvider: {
    key: 'fave',
    name: 'Fave',
    description: '서툰 어른들이 잠시 멈춰 가는 공간, FAVE',
    logoUrl: 'https://cdna.fave.land/d000/logo.png',
    country: 'KR'
  },
  timeslot: {
    dawnString: 'dawn',
    morningString: 'morning',
    afternoonString: 'afternoon',
    nightString: 'night',
    dawnStart: 01,
    morningStart: 07,
    afternoonStart: 13,
    nightStart: 19,
    dawn: [01, 02, 03, 04, 05, 06],
    morning: [07, 08, 09, 10, 11, 12],
    afternoon: [13, 14, 15, 16, 17, 18],
    night: [19, 20, 21, 22, 23, 00]
  }
};
