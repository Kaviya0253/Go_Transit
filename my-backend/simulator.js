// Simulates bus 101 driving along the route and saves its position to Firebase.
const locations = [
  { latitude: 11.0168400, longitude: 76.9688500 },
  { latitude: 11.0167800, longitude: 76.9687200 },
  { latitude: 11.0167000, longitude: 76.9685500 },
  { latitude: 11.0166700, longitude: 76.9685300 },
  { latitude: 11.0165100, longitude: 76.9684600 },
  { latitude: 11.0163000, longitude: 76.9683800 },
  { latitude: 11.0159500, longitude: 76.9682900 },
  { latitude: 11.0156400, longitude: 76.9682200 },
  { latitude: 11.0155700, longitude: 76.9682100 },
  { latitude: 11.0147900, longitude: 76.9680500 },
  { latitude: 11.0147400, longitude: 76.9679100 },
  { latitude: 11.0146800, longitude: 76.9677600 },
  { latitude: 11.0148100, longitude: 76.9677800 },
  { latitude: 11.0150700, longitude: 76.9678400 },
  { latitude: 11.0161300, longitude: 76.9681200 },
  { latitude: 11.0168400, longitude: 76.9684200 },
  { latitude: 11.0171200, longitude: 76.9685800 },
  { latitude: 11.0178900, longitude: 76.9691700 },
  { latitude: 11.0182500, longitude: 76.9694700 },
  { latitude: 11.0185800, longitude: 76.9696900 },
  { latitude: 11.0191000, longitude: 76.9699900 },
  { latitude: 11.0193500, longitude: 76.9701200 },
  { latitude: 11.0198500, longitude: 76.9703500 },
  { latitude: 11.0203600, longitude: 76.9706100 },
  { latitude: 11.0207900, longitude: 76.9708900 },
  { latitude: 11.0206600, longitude: 76.9702100 },
  { latitude: 11.0205300, longitude: 76.9695300 },
  { latitude: 11.0204000, longitude: 76.9688500 },
  { latitude: 11.0202500, longitude: 76.9681000 },
  { latitude: 11.0201000, longitude: 76.9673500 },
  { latitude: 11.0199750, longitude: 76.9666450 },
  { latitude: 11.0198500, longitude: 76.9659400 },
  { latitude: 11.0198600, longitude: 76.9658600 },
  { latitude: 11.0197100, longitude: 76.9650700 },
  { latitude: 11.0195900, longitude: 76.9644400 },
  { latitude: 11.0194700, longitude: 76.9638100 },
  { latitude: 11.0192700, longitude: 76.9626600 },
  { latitude: 11.0191900, longitude: 76.9622200 },
  { latitude: 11.0190700, longitude: 76.9615000 },
  { latitude: 11.0189000, longitude: 76.9607300 },
  { latitude: 11.0188600, longitude: 76.9604700 },
  { latitude: 11.0189100, longitude: 76.9603600 },
  { latitude: 11.0189000, longitude: 76.9603600 },
  { latitude: 11.0189000, longitude: 76.9603500 },
  { latitude: 11.0188900, longitude: 76.9603400 },
  { latitude: 11.0188900, longitude: 76.9603100 },
  { latitude: 11.0188900, longitude: 76.9602700 },
  { latitude: 11.0189400, longitude: 76.9602300 },
  { latitude: 11.0190900, longitude: 76.9600500 },
  { latitude: 11.0192900, longitude: 76.9596900 },
  { latitude: 11.0194200, longitude: 76.9593800 },
  { latitude: 11.0194400, longitude: 76.9592300 },
  { latitude: 11.0195800, longitude: 76.9592200 },
  { latitude: 11.0198400, longitude: 76.9592200 },
  { latitude: 11.0206167, longitude: 76.9592067 },
  { latitude: 11.0213933, longitude: 76.9591933 },
  { latitude: 11.0221700, longitude: 76.9591800 },
  { latitude: 11.0231500, longitude: 76.9591200 },
  { latitude: 11.0235000, longitude: 76.9590800 },
  { latitude: 11.0244400, longitude: 76.9590500 },
  { latitude: 11.0244450, longitude: 76.9584350 },
  { latitude: 11.0244500, longitude: 76.9578200 },
  { latitude: 11.0244600, longitude: 76.9571300 },
  { latitude: 11.0250400, longitude: 76.9571000 },
  { latitude: 11.0250000, longitude: 76.9566400 },
  { latitude: 11.0249900, longitude: 76.9555700 },
  { latitude: 11.0250000, longitude: 76.9555000 },
  { latitude: 11.0250100, longitude: 76.9554700 },
  { latitude: 11.0250500, longitude: 76.9554200 },
  { latitude: 11.0251700, longitude: 76.9554000 },
  { latitude: 11.0256600, longitude: 76.9554600 },
  { latitude: 11.0259800, longitude: 76.9555000 },
  { latitude: 11.0262800, longitude: 76.9555800 },
  { latitude: 11.0266600, longitude: 76.9557000 },
  { latitude: 11.0268100, longitude: 76.9557200 },
  { latitude: 11.0269200, longitude: 76.9557300 },
  { latitude: 11.0269900, longitude: 76.9557400 },
  { latitude: 11.0270400, longitude: 76.9556700 },
  { latitude: 11.0276000, longitude: 76.9552300 },
  { latitude: 11.0278100, longitude: 76.9550900 },
  { latitude: 11.0284000, longitude: 76.9546900 },
  { latitude: 11.0284800, longitude: 76.9546000 },
  { latitude: 11.0285200, longitude: 76.9542000 },
  { latitude: 11.0285200, longitude: 76.9538000 },
  { latitude: 11.0285500, longitude: 76.9532400 },
  { latitude: 11.0285500, longitude: 76.9529700 },
  { latitude: 11.0285100, longitude: 76.9527500 },
  { latitude: 11.0284100, longitude: 76.9524000 },
  { latitude: 11.0284000, longitude: 76.9517000 },
  { latitude: 11.0283800, longitude: 76.9513000 },
  { latitude: 11.0277800, longitude: 76.9513400 },
  { latitude: 11.0269700, longitude: 76.9513500 },
  { latitude: 11.0262900, longitude: 76.9513500 },
  { latitude: 11.0253300, longitude: 76.9514500 },
  { latitude: 11.0248100, longitude: 76.9515300 },
  { latitude: 11.0247700, longitude: 76.9513800 },
  { latitude: 11.0254200, longitude: 76.9512500 },
  { latitude: 11.0260400, longitude: 76.9512000 },
  { latitude: 11.0264500, longitude: 76.9511900 },
  { latitude: 11.0269400, longitude: 76.9511700 },
  { latitude: 11.0269600, longitude: 76.9507000 },
  { latitude: 11.0269600, longitude: 76.9499200 },
  { latitude: 11.0269200, longitude: 76.9494100 },
  { latitude: 11.0268400, longitude: 76.9489400 },
  { latitude: 11.0268300, longitude: 76.9486900 },
  { latitude: 11.0267500, longitude: 76.9481900 },
  { latitude: 11.0267200, longitude: 76.9476500 },
  { latitude: 11.0267500, longitude: 76.9472900 },
  { latitude: 11.0269800, longitude: 76.9471200 },
  { latitude: 11.0270000, longitude: 76.9471000 },
  { latitude: 11.0270100, longitude: 76.9470100 },
  { latitude: 11.0268500, longitude: 76.9463000 },
  { latitude: 11.0266900, longitude: 76.9456100 },
  { latitude: 11.0265600, longitude: 76.9449850 },
  { latitude: 11.0264300, longitude: 76.9443600 },
  { latitude: 11.0262550, longitude: 76.9436900 },
  { latitude: 11.0260800, longitude: 76.9430200 },
  { latitude: 11.0259900, longitude: 76.9425100 },
  { latitude: 11.0258800, longitude: 76.9416400 },
  { latitude: 11.0257100, longitude: 76.9406200 },
  { latitude: 11.0256500, longitude: 76.9401700 },
  { latitude: 11.0256300, longitude: 76.9398100 },
  { latitude: 11.0255700, longitude: 76.9386400 },
  { latitude: 11.0255200, longitude: 76.9382600 },
  { latitude: 11.0254800, longitude: 76.9376700 },
  { latitude: 11.0254500, longitude: 76.9370300 },
  { latitude: 11.0253500, longitude: 76.9360800 },
  { latitude: 11.0252800, longitude: 76.9356300 },
  { latitude: 11.0251200, longitude: 76.9348700 },
  { latitude: 11.0246700, longitude: 76.9351600 },
  { latitude: 11.0240950, longitude: 76.9355450 },
  { latitude: 11.0235200, longitude: 76.9359300 },
  { latitude: 11.0227000, longitude: 76.9365200 },
  { latitude: 11.0222150, longitude: 76.9368800 },
  { latitude: 11.0217300, longitude: 76.9372400 },
  { latitude: 11.0212300, longitude: 76.9375600 },
  { latitude: 11.0208500, longitude: 76.9377800 },
  { latitude: 11.0202600, longitude: 76.9381400 },
  { latitude: 11.0196500, longitude: 76.9385200 },
  { latitude: 11.0194600, longitude: 76.9386500 },
  { latitude: 11.0193800, longitude: 76.9387200 },
  { latitude: 11.0192600, longitude: 76.9387600 },
  { latitude: 11.0186500, longitude: 76.9391550 },
  { latitude: 11.0180400, longitude: 76.9395500 },
  { latitude: 11.0171600, longitude: 76.9401600 },
  { latitude: 11.0162800, longitude: 76.9406800 },
  { latitude: 11.0155700, longitude: 76.9410800 },
  { latitude: 11.0149550, longitude: 76.9414650 },
  { latitude: 11.0143400, longitude: 76.9418500 },
  { latitude: 11.0139200, longitude: 76.9420700 },
  { latitude: 11.0139100, longitude: 76.9420900 },
  { latitude: 11.0138700, longitude: 76.9421200 },
  { latitude: 11.0138200, longitude: 76.9421400 },
  { latitude: 11.0137300, longitude: 76.9421400 },
  { latitude: 11.0136400, longitude: 76.9420700 },
  { latitude: 11.0136200, longitude: 76.9419800 },
  { latitude: 11.0136200, longitude: 76.9419300 },
  { latitude: 11.0136100, longitude: 76.9411900 },
  { latitude: 11.0135950, longitude: 76.9404900 },
  { latitude: 11.0135800, longitude: 76.9397900 },
  { latitude: 11.0135633, longitude: 76.9391783 },
  { latitude: 11.0135467, longitude: 76.9385667 },
  { latitude: 11.0135300, longitude: 76.9379550 },
  { latitude: 11.0135133, longitude: 76.9373433 },
  { latitude: 11.0134967, longitude: 76.9367317 },
  { latitude: 11.0134800, longitude: 76.9361200 },
  { latitude: 11.0134650, longitude: 76.9352850 },
  { latitude: 11.0134500, longitude: 76.9344500 },
  { latitude: 11.0134200, longitude: 76.9338100 },
  { latitude: 11.0133900, longitude: 76.9331700 },
  { latitude: 11.0133600, longitude: 76.9325300 },
  { latitude: 11.0133500, longitude: 76.9322400 },
  { latitude: 11.0133600, longitude: 76.9312200 },
  { latitude: 11.0133900, longitude: 76.9300900 },
  { latitude: 11.0134600, longitude: 76.9295400 },
  { latitude: 11.0135600, longitude: 76.9291300 },
  { latitude: 11.0136500, longitude: 76.9289000 },
  { latitude: 11.0137900, longitude: 76.9286300 },
  { latitude: 11.0139700, longitude: 76.9283000 },
  { latitude: 11.0144000, longitude: 76.9273000 },
  { latitude: 11.0147400, longitude: 76.9265900 },
  { latitude: 11.0148800, longitude: 76.9264100 },
  { latitude: 11.0150500, longitude: 76.9262200 },
  { latitude: 11.0155600, longitude: 76.9256200 },
  { latitude: 11.0158600, longitude: 76.9252500 },
  { latitude: 11.0161300, longitude: 76.9248600 },
  { latitude: 11.0165900, longitude: 76.9238800 },
  { latitude: 11.0167000, longitude: 76.9236100 },
  { latitude: 11.0168800, longitude: 76.9231900 },
  { latitude: 11.0171400, longitude: 76.9226000 },
  { latitude: 11.0172700, longitude: 76.9222200 },
  { latitude: 11.0175200, longitude: 76.9216700 },
  { latitude: 11.0176600, longitude: 76.9214600 },
  { latitude: 11.0179800, longitude: 76.9211100 },
  { latitude: 11.0184200, longitude: 76.9205600 },
  { latitude: 11.0187700, longitude: 76.9201100 },
  { latitude: 11.0189100, longitude: 76.9200100 },
  { latitude: 11.0191100, longitude: 76.9197800 },
  { latitude: 11.0194400, longitude: 76.9193900 },
  { latitude: 11.0202300, longitude: 76.9185700 },
  { latitude: 11.0206000, longitude: 76.9181800 },
  { latitude: 11.0207200, longitude: 76.9180200 },
  { latitude: 11.0208700, longitude: 76.9177300 },
  { latitude: 11.0209800, longitude: 76.9175100 },
  { latitude: 11.0210800, longitude: 76.9173700 },
  { latitude: 11.0213700, longitude: 76.9171100 },
  { latitude: 11.0214500, longitude: 76.9170100 },
  { latitude: 11.0218000, longitude: 76.9160600 },
  { latitude: 11.0219500, longitude: 76.9155200 },
  { latitude: 11.0220400, longitude: 76.9151300 },
  { latitude: 11.0221300, longitude: 76.9146300 },
  { latitude: 11.0222300, longitude: 76.9140300 },
  { latitude: 11.0223200, longitude: 76.9137800 },
  { latitude: 11.0226200, longitude: 76.9130100 },
  { latitude: 11.0228000, longitude: 76.9126200 },
  { latitude: 11.0229100, longitude: 76.9124300 },
  { latitude: 11.0230000, longitude: 76.9122900 },
  { latitude: 11.0231600, longitude: 76.9119900 },
  { latitude: 11.0232300, longitude: 76.9117400 },
  { latitude: 11.0233000, longitude: 76.9114700 },
  { latitude: 11.0233600, longitude: 76.9110000 },
  { latitude: 11.0234900, longitude: 76.9103400 },
  { latitude: 11.0235800, longitude: 76.9097400 },
  { latitude: 11.0237700, longitude: 76.9088400 },
  { latitude: 11.0241500, longitude: 76.9077600 },
  { latitude: 11.0243300, longitude: 76.9072400 },
  { latitude: 11.0245300, longitude: 76.9067600 },
  { latitude: 11.0247000, longitude: 76.9064900 },
  { latitude: 11.0248900, longitude: 76.9063300 },
  { latitude: 11.0251400, longitude: 76.9062700 },
  { latitude: 11.0257200, longitude: 76.9061800 },
  { latitude: 11.0265300, longitude: 76.9059100 },
  { latitude: 11.0265400, longitude: 76.9058900 },
  { latitude: 11.0265600, longitude: 76.9058600 },
  { latitude: 11.0265800, longitude: 76.9058400 },
  { latitude: 11.0266400, longitude: 76.9058400 },
  { latitude: 11.0268700, longitude: 76.9055500 },
  { latitude: 11.0271000, longitude: 76.9052500 },
  { latitude: 11.0272300, longitude: 76.9049700 },
  { latitude: 11.0273200, longitude: 76.9047400 },
  { latitude: 11.0275100, longitude: 76.9041900 },
  { latitude: 11.0275700, longitude: 76.9040800 },
  { latitude: 11.0277900, longitude: 76.9037900 },
  { latitude: 11.0280400, longitude: 76.9034400 },
  { latitude: 11.0281700, longitude: 76.9031900 },
  { latitude: 11.0282500, longitude: 76.9029200 },
  { latitude: 11.0282900, longitude: 76.9027100 },
  { latitude: 11.0283100, longitude: 76.9022300 },
  { latitude: 11.0283200, longitude: 76.9018000 },
  { latitude: 11.0283300, longitude: 76.9017000 },
  { latitude: 11.0283700, longitude: 76.9010250 },
  { latitude: 11.0284100, longitude: 76.9003500 },
  { latitude: 11.0284400, longitude: 76.9003100 },
  { latitude: 11.0284600, longitude: 76.8999500 },
  { latitude: 11.0284400, longitude: 76.8996800 },
  { latitude: 11.0283400, longitude: 76.8993600 },
  { latitude: 11.0283600, longitude: 76.8990800 },
  { latitude: 11.0283500, longitude: 76.8989000 },
  { latitude: 11.0283400, longitude: 76.8988100 },
  { latitude: 11.0283600, longitude: 76.8984100 },
  { latitude: 11.0284200, longitude: 76.8977950 },
  { latitude: 11.0284800, longitude: 76.8971800 },
  { latitude: 11.0285400, longitude: 76.8967700 },
  { latitude: 11.0285700, longitude: 76.8965900 },
  { latitude: 11.0287200, longitude: 76.8960800 },
  { latitude: 11.0288500, longitude: 76.8956700 },
  { latitude: 11.0290800, longitude: 76.8948900 },
  { latitude: 11.0291600, longitude: 76.8946000 },
  { latitude: 11.0292800, longitude: 76.8943100 },
  { latitude: 11.0294300, longitude: 76.8939200 },
  { latitude: 11.0297150, longitude: 76.8932900 },
  { latitude: 11.0300000, longitude: 76.8926600 },
  { latitude: 11.0302900, longitude: 76.8919200 },
  { latitude: 11.0305600, longitude: 76.8911000 },
  { latitude: 11.0308200, longitude: 76.8904200 },
  { latitude: 11.0309000, longitude: 76.8902300 },
  { latitude: 11.0311600, longitude: 76.8897000 },
  { latitude: 11.0313900, longitude: 76.8892900 },
  { latitude: 11.0316400, longitude: 76.8887100 },
  { latitude: 11.0320600, longitude: 76.8879400 },
  { latitude: 11.0322700, longitude: 76.8876300 },
  { latitude: 11.0326100, longitude: 76.8872300 },
  { latitude: 11.0329700, longitude: 76.8868400 },
  { latitude: 11.0334100, longitude: 76.8864600 },
  { latitude: 11.0339400, longitude: 76.8859200 },
  { latitude: 11.0345700, longitude: 76.8853600 },
  { latitude: 11.0350000, longitude: 76.8849300 },
  { latitude: 11.0353200, longitude: 76.8845900 },
  { latitude: 11.0354200, longitude: 76.8844400 },
  { latitude: 11.0356700, longitude: 76.8840200 },
  { latitude: 11.0376800, longitude: 76.8793100 },
  { latitude: 11.0379100, longitude: 76.8789300 },
  { latitude: 11.0382600, longitude: 76.8783200 },
  { latitude: 11.0383200, longitude: 76.8781700 },
  { latitude: 11.0384000, longitude: 76.8778500 },
  { latitude: 11.0385500, longitude: 76.8771850 },
  { latitude: 11.0387000, longitude: 76.8765200 },
  { latitude: 11.0389400, longitude: 76.8753900 },
  { latitude: 11.0390100, longitude: 76.8752000 },
  { latitude: 11.0393000, longitude: 76.8745300 },
  { latitude: 11.0394300, longitude: 76.8741900 },
  { latitude: 11.0396000, longitude: 76.8737700 },
  { latitude: 11.0399000, longitude: 76.8727200 },
  { latitude: 11.0401300, longitude: 76.8718600 },
  { latitude: 11.0403900, longitude: 76.8711500 },
  { latitude: 11.0405300, longitude: 76.8707800 },
  { latitude: 11.0406300, longitude: 76.8706000 },
  { latitude: 11.0407500, longitude: 76.8703900 },
  { latitude: 11.0409600, longitude: 76.8699800 },
  { latitude: 11.0412700, longitude: 76.8693100 },
  { latitude: 11.0414100, longitude: 76.8689800 },
  { latitude: 11.0415500, longitude: 76.8686400 },
  { latitude: 11.0416800, longitude: 76.8681000 },
  { latitude: 11.0417600, longitude: 76.8678300 },
  { latitude: 11.0418600, longitude: 76.8676700 },
  { latitude: 11.0420800, longitude: 76.8672900 },
  { latitude: 11.0425400, longitude: 76.8665100 },
  { latitude: 11.0430100, longitude: 76.8658700 },
  { latitude: 11.0430700, longitude: 76.8657300 },
  { latitude: 11.0431200, longitude: 76.8655100 },
  { latitude: 11.0431700, longitude: 76.8648900 },
  { latitude: 11.0432000, longitude: 76.8647100 },
  { latitude: 11.0432300, longitude: 76.8646300 },
  { latitude: 11.0432500, longitude: 76.8645800 },
];

// The recorded path has dead-end side streets: the bus drives down one and comes back the same way,
// which looks like the bus going backwards. Cut those out-and-back detours.
const removeDetours = (points) => {
  const gap = (a, b) => {
    const dLat = (b.latitude - a.latitude) * 111320;
    const dLng = (b.longitude - a.longitude) * 111320 * Math.cos((a.latitude * Math.PI) / 180);
    return Math.hypot(dLat, dLng);
  };
  const result = [];
  let i = 0;
  while (i < points.length) {
    result.push(points[i]);
    let back = -1;
    for (let j = Math.min(i + 40, points.length - 1); j > i + 2 && back < 0; j--) {
      const returnsHere = gap(points[i], points[j]) < 25;
      const wentFar = points.slice(i + 1, j).some((p) => gap(points[i], p) > 60);
      if (returnsHere && wentFar) back = j;
    }
    i = back > 0 ? back : i + 1;
  }
  return result;
};

// Recorded points wobble (GPS noise, tight clusters, sharp kinks), which made the bus zig-zag.
// Drop clustered points, then round the corners (Chaikin) so the bus glides along a smooth line.
const smoothPath = (points, minGapMetres = 12, rounds = 3) => {
  const gap = (a, b) => {
    const dLat = (b.latitude - a.latitude) * 111320;
    const dLng = (b.longitude - a.longitude) * 111320 * Math.cos((a.latitude * Math.PI) / 180);
    return Math.hypot(dLat, dLng);
  };
  let line = points.filter((p, i) => i === 0 || i === points.length - 1 || gap(points[i - 1], p) >= minGapMetres);
  for (let r = 0; r < rounds; r++) {
    const next = [line[0]];
    for (let i = 0; i < line.length - 1; i++) {
      const a = line[i];
      const b = line[i + 1];
      next.push(
        { latitude: a.latitude * 0.75 + b.latitude * 0.25, longitude: a.longitude * 0.75 + b.longitude * 0.25 },
        { latitude: a.latitude * 0.25 + b.latitude * 0.75, longitude: a.longitude * 0.25 + b.longitude * 0.75 }
      );
    }
    next.push(line[line.length - 1]);
    line = next;
  }
  return line;
};

const route1Path = smoothPath(removeDetours(locations));

// start = how far along its route the bus begins (0 to 1); 0 means the first stop.
const buses = {
  101: { path: route1Path, start: 0 },
};

const TICK_S = 2; // seconds between updates
const ACCEL = 0.7; // m/s^2 speeding up
const DECEL = 1.0; // m/s^2 braking
const CREEP = 2; // m/s (about 7 km/h) while pulling up to a stop
const MIN_CRUISE = 9.8; // m/s (35 km/h)
const MAX_CRUISE = 13.8; // m/s (50 km/h)

const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

// Rough metres between two points (fine for city distances).
const metres = (a, b) => {
  const dLat = (b.latitude - a.latitude) * 111320;
  const dLng = (b.longitude - a.longitude) * 111320 * Math.cos((a.latitude * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
};

// Drives one bus along its path: smooth speed changes, braking into and waiting at every stop.
async function runBus(db, busNumber, { path, start }) {
  const busSnap = await db.ref(`routes/buses/${busNumber}`).once("value");
  const routeId = busSnap.val()?.route_id;
  const stopsSnap = await db.ref(`routes/${routeId}/stops`).once("value");
  const stops = Object.values(stopsSnap.val() || {});

  // Save the path so the map can draw exactly the road this bus drives on.
  await db.ref(`routes/${routeId}/path`).set(path.map((p) => ({ lat: p.latitude, lng: p.longitude })));

  // Distance from the start of the path to every path point.
  const cumulative = [0];
  for (let i = 1; i < path.length; i++) cumulative.push(cumulative[i - 1] + metres(path[i - 1], path[i]));
  const total = cumulative[cumulative.length - 1];

  // Distance along the path of each stop (closest path point).
  const stopDistances = stops.map((stop) => {
    const target = { latitude: stop.lat, longitude: stop.lng };
    let best = 0;
    path.forEach((p, i) => {
      if (metres(p, target) < metres(path[best], target)) best = i;
    });
    return cumulative[best];
  });

  const positionAt = (s) => {
    let i = 1;
    while (i < cumulative.length - 1 && cumulative[i] < s) i++;
    const span = cumulative[i] - cumulative[i - 1] || 1;
    const t = clamp((s - cumulative[i - 1]) / span, 0, 1);
    return {
      latitude: path[i - 1].latitude + (path[i].latitude - path[i - 1].latitude) * t,
      longitude: path[i - 1].longitude + (path[i].longitude - path[i - 1].longitude) * t,
    };
  };

  let s = start * total; // metres travelled
  let v = 0; // current speed, m/s
  let cruise = (MIN_CRUISE + MAX_CRUISE) / 2;
  let dwell = 0;
  let currentStop = "";
  let endWait = 0;
  // A bus that starts partway along the route began its trip a while ago (a full trip is about 38 min)
  let tripStartedAt = new Date(Date.now() - start * 38 * 60000).toISOString();
  let trafficTicks = 0; // updates left in the current slow-traffic patch
  let trafficCap = 0; // speed limit during that patch, m/s

  setInterval(async () => {
    let status = "Running";

    if (s >= total) {
      status = "Trip ended";
      v = 0;
      if (++endWait > 15) {
        s = 0;
        endWait = 0;
        status = "Not started";
        tripStartedAt = new Date().toISOString();
      }
    } else if (dwell > 0) {
      dwell--;
      v = 0;
      status = "At stop";
    } else {
      // The driving speed drifts slowly, like traffic getting a bit heavier or lighter.
      cruise = clamp(cruise + (Math.random() - 0.5) * 0.3, MIN_CRUISE, MAX_CRUISE);
      // Now and then the bus hits slow traffic for 20-40 seconds (11-20 km/h).
      if (trafficTicks === 0 && Math.random() < 0.004) {
        trafficTicks = randomInt(10, 20);
        trafficCap = 3 + Math.random() * 2.5;
      }
      const inTraffic = trafficTicks > 0;
      if (inTraffic) {
        trafficTicks--;
        status = "Slow traffic";
      }
      const nextStop = stopDistances.find((d) => d > s + 1);
      const remaining = (nextStop ?? total) - s;
      // Start braking one update earlier, and creep the last few metres instead of stopping dead.
      const brakingLimit = Math.sqrt(2 * DECEL * Math.max(remaining - v * TICK_S, 0));
      const target = Math.min(inTraffic ? Math.min(cruise, trafficCap) : cruise, Math.max(brakingLimit, CREEP));
      v = clamp(v + clamp(target - v, -DECEL * TICK_S, ACCEL * TICK_S), 0, MAX_CRUISE);
      s += v * TICK_S;

      if (remaining - v * TICK_S < 3) {
        s = nextStop ?? total; // arrived
        v = 0;
        if (nextStop !== undefined && s < total) {
          dwell = randomInt(8, 12); // wait 16-24 seconds
          currentStop = stops[stopDistances.indexOf(nextStop)]?.name || "";
          status = "At stop";
        }
      }
    }

    const { latitude, longitude } = positionAt(Math.min(s, total));
    const upcoming = stopDistances.findIndex((d) => d > s + 1);
    try {
      await db.ref(`routes/buses/${busNumber}/location`).set({
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
        tripStartedAt,
        status,
        nextStop: upcoming === -1 ? "" : stops[upcoming].name,
        currentStop: status === "At stop" ? currentStop : "",
        waitSeconds: status === "At stop" ? dwell * TICK_S : 0,
        speed: Math.round(v * 3.6), // km/h
      });
    } catch (err) {
      console.error(`Simulator update failed for bus ${busNumber}:`, err.message);
    }
  }, TICK_S * 1000);
  console.log(`Simulator started for bus ${busNumber} (${stops.length} stops)`);
}

module.exports = function startSimulator(db) {
  Object.entries(buses).forEach(([busNumber, bus]) =>
    runBus(db, busNumber, bus).catch((err) => console.error(`Bus ${busNumber}:`, err.message))
  );
};

module.exports.smoothPath = smoothPath;
module.exports.removeDetours = removeDetours;
module.exports.rawLocations = locations;
