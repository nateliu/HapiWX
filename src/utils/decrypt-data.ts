import * as crypto from 'crypto';

const decryptData = (encryptedData: string, iv: string, sessionKey: string, appid: string) => {
    // Convert base64-encoded data to Buffer
    const encryptedDataNew = Buffer.from(encryptedData, 'base64');
    const sessionKeyNew = Buffer.from(sessionKey, 'base64');
    const ivNew = Buffer.from(iv, 'base64');

    let decoded = '';
    try {
        // Create a decipher object with AES-128-CBC algorithm
        const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyNew, ivNew);
        // Set auto padding to true (PKCS#7 padding)
        decipher.setAutoPadding(true);
        // Decrypt the data
        decoded = decipher.update(encryptedDataNew as any, 'binary', 'utf8');
        decoded += decipher.final('utf8');
    } catch (err) {
        throw new Error('Illegal Buffer');
    }

    const parsedDecoded = JSON.parse(decoded);

    // Check the 'watermark' property in the decrypted user data,
    // The watermark has appid and timestamp, here we check the appid
    if (parsedDecoded.watermark.appid !== appid) {
        throw new Error('Illegal Buffer');
    }

    // Return the decrypted user data
    return parsedDecoded;
};

export default decryptData;

/*
  {
    "code": "0d3fal000XRNsR1yga200dSYM21fal0I",
    "encryptedData": "Uhrixaxc5HxtlDdatPhyZ2kIsNv3iP7XfU5G7EcDsasy6YnNe27QbSd+6QtOAUCD/icbFgtw3fLJ8mxbKf1jDrYpNj0EH8yaSOThjjjCm7IGx6MhYHO/UidvikIx5PTlKsNkjpMUpl2qE0rawwR+3Fhgdm9KsPhNUFVMPv62RuKaKUU2njGow0j4Dpf/YWDpHk82QNkAL4lkuv1RC9GIwYnx7+gKNKipXuzJA0cch/fBQ5fJR/Jrkb8XHwEfHqqRSaFQzxg673Uy7Iq0KGy6Ker3q5hCEiFT1VPJR0oxnZ7us16uSZir6md+/04tBm3v7Z5Pd2ZaN/+UHNU6eFs2ShTmwFULL+uDEaBoFXN9EYRcAwkf4nwTcd7C2a21ORivJHDjLQZKfOCXb5Qsgeaoju9rDHm2zsPC2xSON87UxBH6O0GYrqtNwwr0YEkiASdgnHkfkg6pNcae0hfm65mGxw==",
    "iv": "noGLdGGk2l/i7VbiXeWqug==",
    "appid": "wx6c6ee18f6f197219",
    "sessionKey":"YYFCE7UXZJeqr2bSZvm4bw=="
  }
  returns data below
  {
    "openId": "oqXPG6xBHVAJABOIUbXw0kxuKNqE",
    "nickName": "微信用户",
    "gender": 0,
    "language": "",
    "city": "",
    "province": "",
    "country": "",
    "avatarUrl": "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
    "watermark": {
      "timestamp": 1706070761,
      "appid": "wx6c6ee18f6f197219"
    }
  }

  {
    "code": "testcodefromwechatwebsite",
    "encryptedData" : "CiyLU1Aw2KjvrjMdj8YKliAjtP4gsMZMQmRzooG2xrDcvSnxIMXFufNstNGTyaGS9uT5geRa0W4oTOb1WT7fJlAC+oNPdbB+3hVbJSRgv+4lGOETKUQz6OYStslQ142dNCuabNPGBzlooOmB231qMM85d2/fV6ChevvXvQP8Hkue1poOFtnEtpyxVLW1zAo6/1Xx1COxFvrc2d7UL/lmHInNlxuacJXwu0fjpXfz/YqYzBIBzD6WUfTIF9GRHpOn/Hz7saL8xz+W//FRAUid1OksQaQx4CMs8LOddcQhULW4ucetDf96JcR3g0gfRK4PC7E/r7Z6xNrXd2UIeorGj5Ef7b1pJAYB6Y5anaHqZ9J6nKEBvB4DnNLIVWSgARns/8wR2SiRS7MNACwTyrGvt9ts8p12PKFdlqYTopNHR1Vf7XjfhQlVsAJdNiKdYmYVoKlaRv85IfVunYzO0IKXsyl7JCUjCpoG20f0a04COwfneQAGGwd5oa+T8yO5hzuyDb/XcxxmK01EpqOyuxINew==",
    "iv": "r7BXXKkLb8qrSNn05n0qiA==",
    "appid": "wx4f4bc4dec97d474b",
    "sessionKey":"tiihtNczf5v6AKRyjwEUhQ=="
  }
  returns data below
  {
    "openId": "oGZUI0egBJY1zhBYw2KhdUfwVJJE",
    "nickName": "Band",
    "gender": 1,
    "language": "zh_CN",
    "city": "Guangzhou",
    "province": "Guangdong",
    "country": "CN",
    "avatarUrl": "http://wx.qlogo.cn/mmopen/vi_32/aSKcBBPpibyKNicHNTMM0qJVh8Kjgiak2AHWr8MHM4WgMEm7GFhsf8OYrySdbvAMvTsw3mo8ibKicsnfN5pRjl1p8HQ/0",
    "unionId": "ocMvos6NjeKLIBqg5Mr9QjxrP1FA",
    "watermark": {
      "timestamp": 1477314187,
      "appid": "wx4f4bc4dec97d474b"
    }
  }
  */
