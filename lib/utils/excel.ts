import * as XLSX from "xlsx";
import { AnalyticsData, TopCard, RecentScan, LinkAnalyticsData } from "@/types/scan-log";

/**
 * Generate Excel file content from analytics data.
 * Returns base64-encoded Excel file.
 */
export function generateExcelExport(analyticsData: AnalyticsData): string {
  const { totalScans, todayScans, monthScans, chartLabels, chartData, topCards, recentScans } = analyticsData;

  // Build rows for all scans table
  const allScansRows: string[][] = [];

  // Header row
  allScansRows.push([
    "ID",
    "Link ID",
    "Kode/Slug",
    "Store Name",
    "Device Type",
    "Browser",
    "Status",
    "Tanggal Scan",
  ]);

  // Data rows from recent scans
  const formatDate = (createdAt: any): string => {
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return "";
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  recentScans.forEach((scan) => {
    allScansRows.push([
      scan.id || "",
      scan.linkId || "",
      scan.linkSlug || "",
      scan.storeName || "",
      scan.deviceType || "Unknown",
      scan.browser || "Unknown",
      scan.status || "valid",
      formatDate(scan.createdAt),
    ]);
  });

  // Build Top Cards sheet data
  const topCardsRows: string[][] = [];

  topCardsRows.push([
    "Rank",
    "Kode",
    "Store Name",
    "Total Scan",
    "Persentase",
  ]);

  topCards.forEach((card, index) => {
    const percentage = totalScans > 0 ? ((card.totalScan / totalScans) * 100).toFixed(2) : "0.00";
    topCardsRows.push([
      String(index + 1),
      card.linkSlug || card.linkId || "",
      card.storeName || "-",
      card.totalScan.toLocaleString("id-ID"),
      `${percentage}%`,
    ]);
  });

  // Build Charts sheet data
  const chartRows: string[][] = [];

  chartRows.push([
    "Waktu",
    "Jumlah Scan",
  ]);

  chartLabels.forEach((label, index) => {
    chartRows.push([
      label,
      String(chartData[index] || 0),
    ]);
  });

  // Build Summary sheet data
  const summaryRows: string[][] = [];

  summaryRows.push([
    "Laporan Analitik Scan Kartu",
    "",
  ]);
  summaryRows.push([
    "Total Scan Semua Waktu",
    totalScans.toLocaleString("id-ID"),
  ]);
  summaryRows.push([
    "Scan Hari Ini",
    todayScans.toLocaleString("id-ID"),
  ]);
  summaryRows.push([
    "Scan Bulan Ini",
    monthScans.toLocaleString("id-ID"),
  ]);
  summaryRows.push([
    "",
    "",
  ]);
  summaryRows.push([
    "Periode Dilapor",
    "Semua Waktu",
  ]);

  // Create workbook using SheetJS
  const workbook = XLSX.utils.book_new();

  // Sheet 1: All Scans
  const allScansSheet = XLSX.utils.aoa_to_sheet(allScansRows);
  XLSX.utils.book_append_sheet(workbook, allScansSheet, "All Scans");

  // Sheet 2: Top Cards
  const topCardsSheet = XLSX.utils.aoa_to_sheet(topCardsRows);
  XLSX.utils.book_append_sheet(workbook, topCardsSheet, "Top Cards");

  // Sheet 3: Charts
  const chartSheet = XLSX.utils.aoa_to_sheet(chartRows);
  XLSX.utils.book_append_sheet(workbook, chartSheet, "Charts");

  // Sheet 4: Summary
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Generate Excel file string
  const excelFile = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "base64",
  });

  return excelFile;
}

/**
 * Generate Excel file content from link analytics data.
 * Returns base64-encoded Excel file.
 */
export function generateLinkExcelExport(analyticsData: LinkAnalyticsData): string {
  const { linkSlug, storeName, totalScans, todayScans, monthScans, chartLabels, chartData, recentScans, deviceBreakdown, browserBreakdown } = analyticsData;

  // Build rows for all scans table
  const allScansRows: string[][] = [];

  // Header row
  allScansRows.push([
    "ID",
    "Kode/Slug",
    "Store Name",
    "Device Type",
    "Browser",
    "Status",
    "Tanggal Scan",
  ]);

  // Data rows from recent scans
  const formatDate = (createdAt: any): string => {
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return "";
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  recentScans.forEach((scan) => {
    allScansRows.push([
      scan.id || "",
      scan.linkSlug || "",
      scan.storeName || "",
      scan.deviceType || "Unknown",
      scan.browser || "Unknown",
      scan.status || "valid",
      formatDate(scan.createdAt),
    ]);
  });

  // Build Charts sheet data
  const chartRows: string[][] = [];

  chartRows.push([
    "Waktu",
    "Jumlah Scan",
  ]);

  chartLabels.forEach((label, index) => {
    chartRows.push([
      label,
      String(chartData[index] || 0),
    ]);
  });

  // Build Device Breakdown sheet data
  const deviceRows: string[][] = [];

  deviceRows.push([
    "Device",
    "Jumlah Scan",
    "Persentase",
  ]);

  const totalDevice = deviceBreakdown.desktop + deviceBreakdown.mobile + deviceBreakdown.tablet;
  deviceRows.push([
    "Desktop",
    deviceBreakdown.desktop.toString(),
    totalDevice > 0 ? `${((deviceBreakdown.desktop / totalDevice) * 100).toFixed(2)}%` : "0%",
  ]);
  deviceRows.push([
    "Mobile",
    deviceBreakdown.mobile.toString(),
    totalDevice > 0 ? `${((deviceBreakdown.mobile / totalDevice) * 100).toFixed(2)}%` : "0%",
  ]);
  deviceRows.push([
    "Tablet",
    deviceBreakdown.tablet.toString(),
    totalDevice > 0 ? `${((deviceBreakdown.tablet / totalDevice) * 100).toFixed(2)}%` : "0%",
  ]);

  // Build Browser Breakdown sheet data
  const browserRows: string[][] = [];

  browserRows.push([
    "Browser",
    "Jumlah Scan",
    "Persentase",
  ]);

  const totalBrowser = Object.values(browserBreakdown).reduce((a, b) => a + b, 0);
  Object.entries(browserBreakdown).forEach(([browser, count]) => {
    browserRows.push([
      browser,
      count.toString(),
      totalBrowser > 0 ? `${((count / totalBrowser) * 100).toFixed(2)}%` : "0%",
    ]);
  });

  // Build Summary sheet data
  const summaryRows: string[][] = [];

  summaryRows.push([
    "Laporan Analitik Kartu",
    "",
  ]);
  summaryRows.push([
    "Kode/Slug",
    linkSlug,
  ]);
  summaryRows.push([
    "Store Name",
    storeName || "-",
  ]);
  summaryRows.push([
    "Total Scan",
    totalScans.toLocaleString("id-ID"),
  ]);
  summaryRows.push([
    "Scan Hari Ini",
    todayScans.toLocaleString("id-ID"),
  ]);
  summaryRows.push([
    "Scan Bulan Ini",
    monthScans.toLocaleString("id-ID"),
  ]);

  // Create workbook using SheetJS
  const workbook = XLSX.utils.book_new();

  // Sheet 1: All Scans
  const allScansSheet = XLSX.utils.aoa_to_sheet(allScansRows);
  XLSX.utils.book_append_sheet(workbook, allScansSheet, "All Scans");

  // Sheet 2: Charts
  const chartSheet = XLSX.utils.aoa_to_sheet(chartRows);
  XLSX.utils.book_append_sheet(workbook, chartSheet, "Charts");

  // Sheet 3: Device Breakdown
  const deviceSheet = XLSX.utils.aoa_to_sheet(deviceRows);
  XLSX.utils.book_append_sheet(workbook, deviceSheet, "Device Breakdown");

  // Sheet 4: Browser Breakdown
  const browserSheet = XLSX.utils.aoa_to_sheet(browserRows);
  XLSX.utils.book_append_sheet(workbook, browserSheet, "Browser Breakdown");

  // Sheet 5: Summary
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Generate Excel file string
  const excelFile = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "base64",
  });

  return excelFile;
}
