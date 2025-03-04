const customers = {
    "1": { name: "Alam Ritz", address: "Kuala Lumpur", phone: "" },
    "2": { name: "Safran", address: "Kuala Lumpur", phone: "" }
};

// Default items with prices
const itemOptions = {
    "Karipap": 0.60,
    "Donat": 0.60,
    "Keria": 0.60,
    "Pulut Panggang": 0.60
};

// Fill customer details when selecting from dropdown
function fillCustomerDetails() {
    let customerId = document.getElementById("customer").value;
    if (customerId) {
        document.getElementById("address").textContent = customers[customerId].address;
        document.getElementById("phone").textContent = customers[customerId].phone;
    } else {
        document.getElementById("address").textContent = "";
        document.getElementById("phone").textContent = "";
    }
}

// Add new item row to the invoice
function addItem() {
    let table = document.getElementById("invoiceTable");
    let row = table.insertRow();

    let select = `<select class="w-full border rounded p-1" onchange="setItemPrice(this)">
                    <option value="">-- Select Item --</option>`;
    for (let item in itemOptions) {
        select += `<option value="${item}">${item}</option>`;
    }
    select += `</select>`;

    row.innerHTML = `
        <td class="border p-2">${select}<input type="text" class="w-full border rounded p-1 mt-1" placeholder="Or enter custom item"></td>
        <td class="border p-2"><input type="number" class="w-full border rounded p-1" value="1" min="1" oninput="updateTotal()"></td>
        <td class="border p-2"><input type="number" class="w-full border rounded p-1" value="0.00" min="0" step="0.01" oninput="updateTotal()"></td>
        <td class="border p-2">RM 0.00</td>
        <td class="border p-2"><button class="bg-red-500 text-white px-2 py-1 rounded" onclick="removeItem(this)">Remove</button></td>
    `;

    updateTotal();
}

// Automatically set price for selected item
function setItemPrice(select) {
    let priceField = select.parentElement.nextElementSibling.nextElementSibling.querySelector("input");
    let selectedItem = select.value;

    if (itemOptions[selectedItem]) {
        priceField.value = itemOptions[selectedItem].toFixed(2);
    }
    updateTotal();
}

// Update total price when quantity or price changes
function updateTotal() {
    let rows = document.querySelectorAll("#invoiceTable tr");
    let grandTotal = 0;

    rows.forEach(row => {
        let qty = parseFloat(row.cells[1].querySelector("input").value) || 0;
        let price = parseFloat(row.cells[2].querySelector("input").value) || 0;
        let total = qty * price;
        row.cells[3].textContent = `RM ${total.toFixed(2)}`;
        grandTotal += total;
    });

    document.getElementById("grandTotal").textContent = grandTotal.toFixed(2);
}

// Remove a row from the invoice
function removeItem(button) {
    let row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    updateTotal();
}

// Generate PDF with table format
function generatePDF() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text("Invoice", 14, 15);

    let customerName = document.getElementById("customer").selectedOptions[0].text;
    let address = document.getElementById("address").textContent;
    let phone = document.getElementById("phone").textContent;

    doc.setFontSize(12);
    doc.text(`Customer: ${customerName}`, 14, 25);
    doc.text(`Address: ${address}`, 14, 32);
    doc.text(`Phone: ${phone}`, 14, 39);

    let tableData = [];

    // Loop through invoice items
    document.querySelectorAll("#invoiceTable tr").forEach(row => {
        let selectField = row.cells[0].querySelector("select");
        let textField = row.cells[0].querySelector("input");
        let qtyField = row.cells[1].querySelector("input");
        let priceField = row.cells[2].querySelector("input");

        // Get item name (either selected or manually entered)
        let selectedItem = selectField ? selectField.value : "";
        let customItem = textField ? textField.value.trim() : "";
        let itemName = customItem !== "" ? customItem : selectedItem;  

        let qty = qtyField ? qtyField.value : "0";
        let price = priceField ? priceField.value : "0.00";
        let total = row.cells[3].textContent.replace("RM", "").trim();

        tableData.push([itemName, qty, price, total]);
    });

    // Generate Table in PDF
    doc.autoTable({
        startY: 50,
        head: [['Item', 'Qty', 'Price (RM)', 'Total (RM)']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [100, 149, 237], textColor: [255, 255, 255] }, // Dark Blue Header
        alternateRowStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] }, // Light Blue Rows
        styles: { cellPadding: 3, fontSize: 10 }
    });

    // Grand Total
    let grandTotal = document.getElementById("grandTotal").textContent;
    doc.text(`Grand Total: RM ${grandTotal}`, 14, doc.lastAutoTable.finalY + 10);

    // Save as PDF
    doc.save("invoice.pdf");
}
