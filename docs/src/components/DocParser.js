import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { createObjectCsvWriter } from "csv-writer";
import XLSX from "xlsx";
import markdownpdf from "markdown-pdf";
import csv from "csv-parser";
import mammoth from "mammoth";
import officeParser from "officeparser";
import unzipper from "unzipper";
import { parseStringPromise } from "xml2js";

class DocParser {
  async parseCSV(req, res) {
    let filePath = req.file?.path;

    if (!filePath) {
      return res.status(400).send({ message: "No CSV file provided" });
    }

    const csvData = [];

    try {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          csvData.push(row);
        })
        .on("end", () => {
          console.log("CSV file successfully processed");
          res.send({ text: csvData });
        })
        .on("error", (error) => {
          console.error("Error while parsing CSV:", error);
          res.status(500).json({
            message: "Failed to process CSV",
            error: error.toString(),
          });
        });
    } catch (error) {
      console.error("Failed to process CSV:", error);
      res.status(500).json({
        message: "Failed to process CSV",
        error: error.toString(),
      });
    }
  }

  async parseDocx(req, res) {
    let filePath = req.file?.path;

    if (!filePath) {
      return res.status(400).send({ message: "No DOCX file provided" });
    }
    try {
      const { value } = await mammoth.extractRawText({ path: filePath });
      res.send({ text: value });
    } catch (error) {
      console.warn("Mammoth failed, falling back to manual extraction:", error);

      try {
        const zip = await unzipper.Open.file(filePath);
        const documentFile = zip.files.find(
          (d) => d.path === "word/document.xml"
        );

        if (!documentFile) {
          throw new Error(
            "Unable to find 'word/document.xml' in the DOCX file."
          );
        }

        const content = await documentFile.buffer();
        const parsedContent = await parseStringPromise(content.toString());
        const extractedText = this.extractTextFromParsedContent(parsedContent);

        res.send({ text: extractedText });
      } catch (fallbackError) {
        console.error("Failed to process DOCX with fallback:", fallbackError);
        res.status(500).json({
          message: "Failed to process DOCX",
          error: fallbackError.toString(),
        });
      }
    }
  }

  extractTextFromParsedContent(parsedContent) {
    let text = "";
    const extractText = (node) => {
      if (node["w:t"]) {
        text += node["w:t"].join("") + " ";
      }
      if (node["w:p"]) {
        node["w:p"].forEach(extractText);
      }
      if (node["w:body"]) {
        extractText(node["w:body"][0]);
      }
    };
    extractText(parsedContent);
    return text.trim();
  }

  async parseExcel(req, res) {
    let filePath = req.file?.path;

    if (!filePath) {
      return res.status(400).send({ message: "No Excel file provided" });
    }

    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const content = XLSX.utils.sheet_to_json(sheet);

      res.status(200).send({ text: content });
    } catch (error) {
      console.error("Failed to process Excel file:", error);
      res.status(500).json({
        message: "Failed to process Excel file",
        error: error.toString(),
      });
    }
  }

  async parseMarkdown(req, res) {
    let filePath = req.file?.path;

    if (!filePath) {
      return res.status(400).send({ message: "No Markdown file provided" });
    }

    try {
      const data = fs.readFileSync(filePath, "utf8");
      res.send({ text: data });
    } catch (error) {
      console.error("Failed to process Markdown file:", error);
      res.status(500).json({
        message: "Failed to process Markdown file",
        error: error.toString(),
      });
    }
  }

  async parseTxt(req, res) {
    let filePath = req.file?.path;

    if (!filePath) {
      return res.status(400).send({ message: "No TXT file provided" });
    }

    try {
      const data = fs.readFileSync(filePath, "utf8");
      res.send({ text: data });
    } catch (error) {
      console.error("Failed to process TXT file:", error);
      res.status(500).json({
        message: "Failed to process TXT file",
        error: error.toString(),
      });
    }
  }

  async parseFile(req, res) {
    let filePath = req.file?.path;
    const format = filePath.split(".").pop();

    if (!filePath) {
      return res.status(400).send({ message: "No file provided" });
    }

    try {
      if (format === "csv") {
        await this.parseCSV(req, res);
      } else if (format === "pdf") {
        const data = await officeParser.parseOfficeAsync(filePath);
        res.send({ text: data });
      } else if (format === "docx") {
        await this.parseDocx(req, res);
      } else if (format === "excel" || format === "xlsx") {
        await this.parseExcel(req, res);
      } else if (format === "md") {
        await this.parseMarkdown(req, res);
      } else if (format === "txt") {
        await this.parseTxt(req, res);
      } else {
        res.status(400).send({ message: "Unsupported file format" });
      }
    } catch (error) {
      console.error("Failed to process file:", error);
      res
        .status(500)
        .json({ message: "Failed to process file", error: error.toString() });
    }
  }

  convertToDOCx(res, __dirname, uploadsDir, inputPath) {
    const outputPath = path.join(uploadsDir, "output.docx");
    const referenceDocxPath = path.join(
      __dirname,
      "utils/custom-reference.docx"
    );

    if (!fs.existsSync(referenceDocxPath)) {
      console.error(
        `Reference DOCX template not found at ${referenceDocxPath}`
      );
      res.status(500).send("Reference DOCX template not found");
      return;
    }

    const pandocCommand = `pandoc -f markdown -t docx ${inputPath} -o ${outputPath} --reference-doc=${referenceDocxPath} --verbose`;

    exec(pandocCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${stderr}`);
        res.status(500).send("Error converting Markdown to DOCX");
        return;
      }

      fs.access(outputPath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error("DOCX file not created properly");
          res.status(500).send("Error creating DOCX file");
        } else {
          res.download(outputPath, "output.docx", (err) => {
            if (err) {
              console.error(err);
              res.status(500).send("Error downloading the file");
            } else {
              fs.unlinkSync(outputPath);
            }
          });
        }
      });
    });
  }

  async convertToCSV(markdownString, res, __dirname, uploadsDir, inputPath) {
    const outputPath = path.join(uploadsDir, "output.csv");
    let records;
    let headers = [];

    try {
      const parsedData = JSON.parse(markdownString);

      if (Array.isArray(parsedData)) {
        if (parsedData.length > 0 && typeof parsedData[0] === "object") {
          headers = Object.keys(parsedData[0]);
          records = parsedData.map((item) =>
            headers.map((header) => item[header])
          );
        } else {
          records = parsedData;
        }
      } else if (typeof parsedData === "object") {
        headers = Object.keys(parsedData);
        records = [Object.values(parsedData)];
      } else {
        throw new Error("Unsupported JSON format");
      }
    } catch (e) {
      const lines = markdownString.split("\n");
      records = lines.map((line) => line.split(",").map((cell) => cell.trim()));
      headers = records[0];
    }

    const csvWriterInstance = createObjectCsvWriter({
      path: outputPath,
      header: headers.map((header, index) => ({
        id: `field${index}`,
        title: header,
      })),
    });

    const data = records.slice(1).map((row) => {
      const obj = {};
      row.forEach((value, index) => {
        obj[`field${index}`] = value;
      });
      return obj;
    });

    await csvWriterInstance.writeRecords(data);
    res.download(outputPath, "output.csv", (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error downloading the file");
      } else {
        fs.unlinkSync(outputPath);
      }
    });
  }

  async convertToExcel(markdownString, res, __dirname, uploadsDir, inputPath) {
    const outputPath = path.join(uploadsDir, "output.xlsx");
    let records;

    try {
      const parsedData = JSON.parse(markdownString);

      if (Array.isArray(parsedData)) {
        if (parsedData.length > 0 && typeof parsedData[0] === "object") {
          const keys = Object.keys(parsedData[0]);
          records = [keys];
          parsedData.forEach((item) => {
            records.push(keys.map((key) => item[key]));
          });
        } else {
          records = parsedData;
        }
      } else if (typeof parsedData === "object") {
        records = [Object.keys(parsedData), Object.values(parsedData)];
      } else {
        throw new Error("Unsupported JSON format");
      }
    } catch (e) {
      const lines = markdownString.split("\n");
      records = lines.map((line) =>
        line.split(",").map((cell) => cell.replace(/\r/g, ""))
      );
    }

    const worksheet = XLSX.utils.aoa_to_sheet(records);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, outputPath);

    fs.access(outputPath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error("Excel file not created properly");
        res.status(500).send("Error creating Excel file");
      } else {
        res.download(outputPath, "output.xlsx", (err) => {
          if (err) {
            console.error(err);
            res.status(500).send("Error downloading the file");
          } else {
            fs.unlinkSync(outputPath);
          }
        });
      }
    });
  }

  /*const outputPath = path.join(uploadsDir, "output.pdf");
        markdownpdf()
          .from(inputPath)
          .to(outputPath, () => {
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
              "Content-Disposition",
              "attachment; filename=output.pdf"
            );
            res.download(outputPath, "output.pdf", (err) => {
              if (err) {
                console.error(err);
                res.status(500).send("Error downloading the file");
              } else {
                fs.unlinkSync(outputPath);
              }
            });
          });*/

  async convertToPDF(markdownString, res, __dirname, uploadsDir, inputPath) {
    const outputPath = path.join(uploadsDir, "output.pdf");
    markdownpdf()
      .from(inputPath)
      .to(outputPath, () => {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=output.pdf");
        res.download(outputPath, "output.pdf", (err) => {
          if (err) {
            console.error(err);
            res.status(500).send("Error downloading the file");
          } else {
            fs.unlinkSync(outputPath);
          }
        });
      });
  }

  async converToDoc(req, res, __dirname) {
    const markdownString = req.body.doc;
    const docFormat = req.body.format;

    if (!markdownString || !docFormat) {
      return res.status(400).json({ message: "Invalid request parameters" });
    }

    const uploadsDir = path.join(__dirname, "uploads", "doctmp");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const inputPath = path.join(uploadsDir, "input.md");
    fs.writeFileSync(inputPath, markdownString);

    try {
      if (docFormat === "docx") {
        this.convertToDOCx(res, __dirname, uploadsDir, inputPath);
      } else if (docFormat === "csv") {
        await this.convertToCSV(
          markdownString,
          res,
          __dirname,
          uploadsDir,
          inputPath
        );
      } else if (docFormat === "excel" || docFormat === "xlsx") {
        await this.convertToExcel(
          markdownString,
          res,
          __dirname,
          uploadsDir,
          inputPath
        );
      } else if (docFormat === "pdf") {
        await this.convertToPDF(
          markdownString,
          res,
          __dirname,
          uploadsDir,
          inputPath
        );
      }
    } catch (error) {
      console.error("Failed to process Doc:", error);
      res
        .status(500)
        .json({ message: "Failed to process Doc", error: error.toString() });
    }
  }
}

export default DocParser;
