export function calculateRumpun(dataNilai: any[], subjectRumpun: any[], payload: any[], target: any[], type: string) {
    const rumpun = dataNilai.filter(item => subjectRumpun.map(item => item.subjectId).includes(item.subjectId))
    const nilaiPengetahuan = rumpun.map(item => +item.nilaiPengetahuan)
    const nilaiKeterampilan = rumpun.map(item => +item.nilaiKeterampilan)

    const avgPengetahuan = nilaiPengetahuan.reduce((acc, curr) => acc + curr, 0) / nilaiPengetahuan.length
    const avgKeterampilan = nilaiKeterampilan.reduce((acc, curr) => acc + curr, 0) / nilaiKeterampilan.length
    // return rumpun
    // payload.push({subjectId: pai[0]?.subjectId ,nilaiPengetahuan: avgPengetahuan, nilaiKeterampilan: avgKeterampilan, nilaiSikap: rumpun.find(item => item.subjectId === rumpunPai.find(rp => rp.name?.toLowerCase() == 'siroh wa tarikh')?.subjectId).nilaiSikap})
    if (type == 'pai' ) {
        payload!.find(item => item.subjectId == target[0]?.subjectId)!.nilaiPengetahuan = avgPengetahuan
        payload!.find(item => item.subjectId == target[0]?.subjectId)!.nilaiKeterampilan = avgKeterampilan
        payload!.find(item => item.subjectId == target[0]?.subjectId)!.nilaiSikap = rumpun?.find(item => item?.subjectId === subjectRumpun?.find(rp => rp.name?.toLowerCase() == 'siroh wa tarikh')?.subjectId)!.nilaiSikap
    } 
    if (type == 'bahasa') {
        payload!.find(item => item.subjectId == target[0]?.subjectId)!.nilaiPengetahuan = avgPengetahuan
        payload!.find(item => item.subjectId == target[0]?.subjectId)!.nilaiKeterampilan = avgKeterampilan
        payload!.find(item => item.subjectId == target[0]?.subjectId)!.nilaiSikap = rumpun?.find(item => item?.subjectId === subjectRumpun?.find(rp => rp.name?.toLowerCase() == 'muhadatsah' || rp!.name?.toLowerCase() == 'aby' )?.subjectId)!.nilaiSikap
    }
    // return {subjectId: pai[0]?.subjectId ,nilaiPengetahuan: avgPengetahuan, nilaiKeterampilan: avgKeterampilan, nilaiSikap: rumpun.find(item => item.subjectId === rumpunPai.find(rp => rp.name?.toLowerCase() == 'siroh wa tarikh')?.subjectId).nilaiSikap}
    return payload
  }

  function calcutaleRaportResultDetail(data: any, type: string) {
    const harianData = data.filter((item) => item?.type === "HARIAN");
    const utsData = data.filter((item) => item?.type === "UTS");
    const uasData = data.filter((item) => item?.type === "UAS");

    const harianSum = harianData.reduce(
      (sum, item) => sum + parseFloat(type === 'nilaiKeterampilan' ? item?.nilaiKeterampilan : item?.nilaiPengetahuan),
      0
    );
    const utsSum = utsData.reduce(
      (sum, item) => sum + parseFloat(type === 'nilaiKeterampilan' ? item?.nilaiKeterampilan : item?.nilaiPengetahuan),
      0
    );
    const uasWeightedSum =
      0.7 * ((harianSum + utsSum) / (harianData.length + utsData.length)) +
      0.3 * parseFloat(type === 'nilaiKeterampilan' ? uasData[0]?.nilaiKeterampilan : uasData[0]?.nilaiPengetahuan);

    return uasWeightedSum
  }

export const calcutaleRaportResult = (nilai: any[], subjectId: string, rawPayload: any[]) => {
    const nilaiPengetahuanItems = nilai?.filter(bn => bn.subjectId == subjectId)?.filter(
      (item) => "nilaiPengetahuan" in item
    );
    const nilaiKeterampilanItems = nilai?.filter(bn => bn.subjectId == subjectId)?.filter(
      (item) => "nilaiKeterampilan" in item
    );
    const nilaiSikapItem = nilai?.filter(bn => bn.subjectId == subjectId)?.filter(
      (item) => "nilaiSikap" in item
    );

    rawPayload.push({subjectId ,nilaiPengetahuan: calcutaleRaportResultDetail(nilaiPengetahuanItems, 'nilaiPengetahuan'), nilaiKeterampilan: calcutaleRaportResultDetail(nilaiKeterampilanItems, 'nilaiKeterampilan'), nilaiSikap: nilaiSikapItem[0]?.nilaiSikap})
    return {subjectId ,nilaiPengetahuan: calcutaleRaportResultDetail(nilaiPengetahuanItems, 'nilaiPengetahuan'),
      nilaiKeterampilan: calcutaleRaportResultDetail(nilaiKeterampilanItems, 'nilaiKeterampilan'), nilaiSikap: nilaiSikapItem[0]?.nilaiSikap
    };
  };