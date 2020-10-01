const ss = SpreadsheetApp.getActive()
const secret = ''

function test () {
  var now = new Date();
  
  for(i=0; i < 5; i++){
    let item1 = {
      dateTime: Utilities.formatDate(now, "JST", "yyyy-MM-dd HH:mm:ss"),
      sensorId: '',
      temp: Math.floor(Math.random() * 5)+20,
      hum: Math.floor(Math.random() * 21)+60,
      secret: ''
    }
    onPost(item1)
    
    let item2 = {
      dateTime: Utilities.formatDate(now, "JST", "yyyy-MM-dd HH:mm:ss"),
      sensorId: '',
      temp: Math.floor(Math.random() * 5)+20,
      hum: Math.floor(Math.random() * 21)+60,
      secret: ''
    }
    onPost(item2)
    now.setMinutes(now.getMinutes() + 5);
  }
  
}

//　エントリポイント
function doPost (e) {
  let contents
  try {
    contents = JSON.parse(e.postData.contents)
  } catch (e) {
    return response({ error: 'Invalid JSON format.' })
  }

  let result = onPost(contents)
  return response(result)
  
}

/** --- API --- */
function onPost (item) {
  let validationResult = isValid(item)
  console.log(validationResult)
  
  if (validationResult.result === false) {
    console.log('error')
    return {
      error: validationResult.msg
    }
  }

  const { dateTime, sensorId, temp, hum } = item
  const roomName = getRoomNameBySensorId(sensorId)
  const sheet = ss.getSheetByName('Log')
  const row = [dateTime, roomName, temp, hum]
  sheet.appendRow(row)

  return { dateTime, sensorId, temp, hum }
}

          
/** --- Utils --- */        

//リクエストパラメータのバリデーションを行います。
function isValid (item = {}) {
  const keys = ['dateTime', 'sensorId', 'temp', 'hum', 'secret']

  // すべてのキーが存在するか
  for (const key of keys) {
    if (item[key] === undefined) return {result: false, msg:'The parameter not enought['+ key +'].'}
  }

  // シークレット判定
  if (item['secret'] !== secret) return {result: false, msg:'Invalid secret.'}

  // 日付が正しい形式であるか
  const dateReg = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]) ([01]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/
  if (!dateReg.test(item['dateTime'])) return {result: false, msg:'Invalid DateTime format.'}
  
  // センサーIDが文字列であるか
  if (typeof item['sensorId'] !== 'string') return {result: false, msg:'The sensorId is not string.'}
  
  // 入力された気温と湿度が数字であるか
  if (typeof item['temp'] !== 'number') return {result: false, msg:'The temp is not number.'}
  if (typeof item['hum'] !== 'number') return {result: false, msg:'The hum is not number.'}

  return {result: true, msg:''}
}

//センサーIDから部屋名を検索します。
function getRoomNameBySensorId (id = '') {
  const sheet = ss.getSheetByName('Room')
  var lastRow=sheet.getDataRange().getLastRow(); //対象となるシートの最終行を取得

  for(var i=1;i<=lastRow;i++){
    if(sheet.getRange(i,1).getValue() === id){
      return sheet.getRange(i, 2).getValue();
    }
  }
  return id;
}

//レスポンスを作成します。
function response (content) {
  const res = ContentService.createTextOutput()
  res.setMimeType(ContentService.MimeType.JSON)
  res.setContent(JSON.stringify(content))
  return res
}