import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePDFReport = (
  stats,
  categoryData,
  recentReceipts
) => {

  const doc = new jsPDF();

  // Title

  doc.setFontSize(22);
  doc.text(
    "SnapVault AI Financial Report",
    20,
    20
  );

  doc.setFontSize(12);

  doc.text(
    `Generated: ${new Date().toLocaleDateString()}`,
    20,
    30
  );

  // Summary

  doc.setFontSize(16);

  doc.text(
    "Financial Summary",
    20,
    50
  );

  doc.setFontSize(12);

  doc.text(
    `Total Expenses: RM ${stats.totalExpenses.toFixed(2)}`,
    20,
    60
  );

  doc.text(
    `Total Receipts: ${stats.receiptCount}`,
    20,
    70
  );

  doc.text(
    `Average Spend: RM ${stats.averageExpense.toFixed(2)}`,
    20,
    80
  );

  // Category Table

  autoTable(doc, {
    startY: 100,

    head: [["Category", "Amount (RM)"]],

    body: categoryData.map(item => [
      item.name,
      item.value.toFixed(2)
    ])
  });

  // Recent Receipts Table

  autoTable(doc, {

    startY:
      doc.lastAutoTable.finalY + 20,

    head: [
      [
        "Merchant",
        "Category",
        "Amount"
      ]
    ],

    body: recentReceipts.map(
      receipt => [

        receipt.merchant,

        receipt.category,

        Number(
          receipt.amount
        ).toFixed(2)

      ]
    )
  });

  doc.save(
    "SnapVault_Report.pdf"
  );
};