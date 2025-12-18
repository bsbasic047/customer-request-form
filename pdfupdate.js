const { PDFDocument } = PDFLib;

async function updatePdf() {

    const v = id => document.getElementById(id)?.value || "";


    // ---------- RAW FORM VALUES ----------
    const requestType = v("requestType");
    const accountNumber = v("accountNumber");
    const firstName = v("firstName");
    const lastName = v("lastName");
    const fatherName = v("fatherName");
    const city = v("city");
    const district = v("district");
    const pincode = v("pincode");
    const mobile = v("mobile").replace(/^(\+91|91|0)/, "");
    const email = v("email");
    const monthlyIncome = v("monthlyIncome");
    const panNumber = v("panNumber");
    const ovdType = v("ovdType");
    const ovdNumber = v("ovdNumber");
    const gender = v("gender");
    const religion = v("religion");
    const category = v("category");
    const occupation = v("occupation");
    const occupationType = v("occupationType");
    const designation = v("designation");
    const branchRaw = v("branch");
    const formDate = v("formDate");
    const dateOfBirth = v("dateOfBirth");

    const doorApartment = v("doorApartment");
    const streetName = v("streetName");
    const area = v("area");

    const state = v("state");
    const country = v("country");

    // ---------- DERIVED VALUES ----------
    const fullName = `${firstName} ${lastName}`.trim();

    const fullAddress = [doorApartment, streetName, area]
        .filter(Boolean)
        .join(", ");

    const completeAddress = [doorApartment, streetName, area, city, district]
        .filter(Boolean)
        .join(", ");

    let addr1 = "";
    let addr2 = "";

    if (fullAddress.length > 40) {
        let cut = fullAddress.slice(0, 40);
        const lastComma = cut.lastIndexOf(",");
        if (lastComma !== -1) {
            addr1 = cut.slice(0, lastComma);
            addr2 = fullAddress.slice(lastComma + 1).trim().slice(0, 40);
        } else {
            addr1 = cut;
            addr2 = fullAddress.slice(40).trim().slice(0, 40);
        }
    } else {
        addr1 = fullAddress;
        addr2 = "";
    }

    const [bnameRaw, bcodeRaw] = branchRaw.split("-");
    const bname = (bnameRaw || "").trim();
    const bcode = (bcodeRaw || "").replace(/\D/g, "").padStart(5, "0");

    const fmtDate = d => {
        if (!d) return "";
        const x = new Date(d);
        const dd = String(x.getDate()).padStart(2, "0");
        const mm = String(x.getMonth() + 1).padStart(2, "0");
        const yyyy = x.getFullYear();
        return { dmy: `${dd}/${mm}/${yyyy}`, ddmmyyyy: `${dd}${mm}${yyyy}` };
    };

    const fd = fmtDate(formDate);
    const dob = fmtDate(dateOfBirth);

    // ---------- LOAD PDF ----------
    const pdfBytes = await fetch("template.pdf").then(r => r.arrayBuffer());
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const setText = (name, val) =>
        form.getTextField(name).setText((val || "").toUpperCase());

    const setYes = (name, cond) => {
    if (!cond) return;
    try {
        form.getCheckBox(name).check();
    } catch (e) {
        // silently ignore if checkbox doesn't exist
    }
    };


    // ---------- TEXT FIELDS ----------
    setText("ACCNO", accountNumber);
    setText("ACCNO-16F", accountNumber);
    setText("ADDR1-40F", addr1);
    setText("ADDR2-40F", addr2);
    setText("BCODE", bcode);
    setText("BCODE-5F", (bcode || "").slice(0, 5));
    setText("BNAME", bname);
    setText("BNAME-18F", (bname || "").slice(0, 18));
    setText("BNAME-21F", (bname || "").slice(0, 21));
    setText("CITY-13F", (city || "").slice(0, 13));
    setText("COUNTRY-13F", (country || "").slice(0, 13));
    setText("DATE", fd.dmy);
    setText("DATE-8F", fd.ddmmyyyy);
    setText("DESIG-13F", (designation || "").slice(0, 13));
    setText("DISTRICT-23F", (district || "").slice(0, 23));
    setText("DOB-8F", dob.ddmmyyyy);
    setText("FATHER-40F", (fatherName || "").slice(0, 40));
    setText("FNAME-39F", (firstName || "").slice(0, 39));
    setText("FULL-ADDR", completeAddress + " - " + (pincode || ""));
    setText("FULL-NAME", fullName);
    setText("INCOME-16F", (monthlyIncome || "").slice(0, 16));
    setText("LNAME-39F", (lastName || "").slice(0, 39));
    setText("MAIL-24F", (email || "").slice(0, 24));
    setText("MOBILE-10F", (mobile || "").slice(0, 10));
    setText("OVD-NAME", (ovdType || "").slice(0, 40));
    setText("OVD-NO", ovdNumber);
    setText("OVD-NO-24F", (ovdNumber || "").slice(0, 24));
    setText("PAN-10F", (panNumber || "").slice(0, 10));
    setText("PINCODE-6F", (pincode || "").slice(0, 6));
    setText("STATE-13F", (state || "").slice(0, 13));

    // ---------- CHECKBOX LOGIC ----------
    setYes("CG-CB", occupationType === "CENTRAL_GOVT");
    setYes("DEFENCE-CB", occupationType === "DEFENSE");
    setYes("PSU-CB", occupationType === "PSU");
    setYes("PVT-CB", occupationType === "PRIVATE");
    setYes("SG-CB", occupationType === "STATE_GOVT");

    setYes("HOUSEWIFE-CB", occupation === "HOUSEWIFE");
    setYes("STUDENT-CB", occupation === "STUDENT");
    setYes("OTHPROF-CB", occupation === "BUSINESS");

    setYes("MALE-CB", gender === "MALE");
    setYes("FEMALE-CB", gender === "FEMALE");
    setYes("TRANS-CB", gender === "TRANSGENDER");

    setYes("HINDU-CB", religion === "HINDU");
    setYes("CHRIST-CB", religion === "CHRISTIAN");
    setYes("MUSLIM-CB", religion === "MUSLIM");
    setYes("SIKH-CB", religion === "SIKH");

    setYes("GEN-CB", category === "GENERAL");
    setYes("OBC-CB", category === "OBC");
    setYes("SC-CB", category === "SC");
    setYes("ST-CB", category === "ST");

    setYes("UID-CB", ovdType === "AADHAAR");
    setYes("PASSPORT-CB", ovdType === "PASSPORT");
    setYes("DL-CB", ovdType === "DRIVING_LICENSE");
    setYes("VOTERID-CB", ovdType === "VOTER_ID");

    // ---------- REQUEST TYPE ----------
    if (requestType !== "ACCOUNT_ACTIVATION") {
    const pageCount = pdfDoc.getPageCount();
    if (pageCount > 0) {
        pdfDoc.removePage(pageCount - 1);
    }
}

    // ---------- DOWNLOAD ----------
    const finalPdf = await pdfDoc.save();
    const blob = new Blob([finalPdf], { type: "application/pdf" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${fullName} Request.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
}
