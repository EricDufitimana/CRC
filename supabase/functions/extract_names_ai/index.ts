import "jsr:@supabase/functions-js/edge-runtime.d.ts"
//@ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
//@ts-ignore
import { Groq } from 'https://esm.sh/groq-sdk@0.3.0'
//@ts-ignore
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs'

// Initialize Supabase client
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Initialize Groq client
const groq = new Groq({
  apiKey: Deno.env.get('GROQ_API_KEY') ?? '',
})

// Rate limiter
class RateLimiter {
  private requests: number[] = []
  private maxRequests = 50
  private windowMs = 60000 // 1 minute

  async waitIfNeeded(): Promise<void> {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.windowMs)
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests)
      const waitTime = this.windowMs - (now - oldestRequest)
      if (waitTime > 0) {
        console.log(`⏳ Rate limit reached, waiting ${waitTime}ms...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
    
    this.requests.push(now)
  }
}

const rateLimiter = new RateLimiter()

// Enhanced F-designation detection that scans entire workbook
function scanForFDesignations(workbook: any): string[] {
  const fNames: string[] = []
  
  workbook.SheetNames.forEach((sheetName: string) => {
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    jsonData.forEach((row: any, rowIndex: number) => {
      if (Array.isArray(row)) {
        row.forEach((cell: any, colIndex: number) => {
          if (typeof cell === 'string') {
            const cellValue = String(cell).trim()
            
            // COMPREHENSIVE F-DESIGNATION PATTERNS
            const fPatterns = [
              /\bF2\s+[A-Z]/i,    // F2 Kevin
              /\bF4\s+[A-Z]/i,    // F4 Ingabire  
              /\bF6\s+[A-Z]/i,    // F6 Kevin
              /[A-Z]\s+F2\b/i,    // Divine F2
              /[A-Z]\s+F4\b/i,    // Something F4
              /[A-Z]\s+F6\b/i     // Something F6
            ]
            
            fPatterns.forEach((pattern, patternIndex) => {
              if (pattern.test(cellValue)) {
                console.log(`🎯 F-DESIGNATION PATTERN ${patternIndex} at ${sheetName}[${rowIndex},${colIndex}]: "${cellValue}"`)
                
                // Try to extract full name context
                let fullName = cellValue
                
                // If this is just "F2 Kevin", look for last name in adjacent cells
                if (fullName.split(' ').length === 2 && colIndex + 1 < row.length) {
                  const nextCell = row[colIndex + 1]
                  if (typeof nextCell === 'string' && nextCell.trim()) {
                    fullName = `${fullName} ${nextCell.trim()}`
                  }
                }
                
                fNames.push(fullName)
              }
            })
          }
        })
      }
    })
  })
  
  return Array.from(new Set(fNames)) // Remove duplicates
}

// Extract text from Excel files properly

function extractTextFromExcel(fileBytes: Uint8Array): string {
  console.log('📊 Parsing Excel file with SheetJS...')
  
  try {
    // Read the workbook
    const workbook = XLSX.read(fileBytes, { type: 'array' })
    
    console.log('📑 Workbook sheets:', workbook.SheetNames)
    
    let allText = ''
    
    // Process each sheet
    workbook.SheetNames.forEach((sheetName: string) => {
      const worksheet = workbook.Sheets[sheetName]
      
      // Convert sheet to CSV (easiest way to get all text content)
      const csv = XLSX.utils.sheet_to_csv(worksheet)
      allText += `\n=== Sheet: ${sheetName} ===\n${csv}\n`
      
      console.log(`📄 Sheet "${sheetName}" - ${csv.length} characters extracted`)
    })
    
    console.log('✅ Total text extracted:', allText.length, 'characters')
    return allText
    
  } catch (error) {
    console.error('❌ Excel parsing error:', error)
    throw new Error(`Failed to parse Excel file: ${(error as Error).message}`)
  }
}

// Extract names directly from Excel with pattern matching
function extractNamesFromExcel(fileBytes: Uint8Array): {
  success: boolean
  names: string[]
  confidence: number
  reasoning: string
} {
  console.log('🔍 Direct name extraction from Excel...')
  
  // Names to exclude
  const excludedNames = new Set([
    'KATHERINE JOHNSON', 'YVAN BURAVAN', 'Chinua Achebe', 'RUGANZU NDOLI 2', 
    'Pelé (Edson Arantes Do Nascimento)', 'Toni Morrison', 'Ubald Rugirangoga', 
    'Charles Babbage', 'Alfred Nobel', 'Ruth Bader Ginsberg', 'AOUA KEITA', 
    'Fannie Lou Hamer', 'Niyitegeka Felestin', 'Lance Reddick', 'ADA loveloce', 
    'Rosalie Gicanda', 'Irena Sendler', 'Thomas Edison', 'Family 1', 'Family 2', 
    'Family 3', 'Family 4', 'Family 5', 'Family 6'
  ])
  
  // Grades and subjects to exclude
  const excludedTerms = new Set([
    'Ijabo', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'Primary', 'Secondary',
    'Mathematics', 'Computer Science', 'Economics', 'History', 'Geography', 
    'Literature', 'Physics', 'Chemistry', 'Biology', 'English'
  ])
  
  try {
    const workbook = XLSX.read(fileBytes, { type: 'array' })
    const names = new Set<string>()
    
    // Scan for F-designations throughout the entire workbook
    console.log('🔍 Scanning entire workbook for F-designations...')
    const fDesignatedNames = scanForFDesignations(workbook)
    fDesignatedNames.forEach(fName => {
      console.log(`✅ F-DESIGNATION CAPTURED: ${fName}`)
      names.add(fName)
    })
    
    workbook.SheetNames.forEach((sheetName: string) => {
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      console.log(`📄 Processing sheet "${sheetName}" with ${jsonData.length} rows`)
      
      // Look for firstName and lastName columns specifically
      const headers = jsonData[0] as string[]
      const firstNameIndex = headers?.findIndex(h => h?.toLowerCase().includes('firstname') || h?.toLowerCase().includes('first'))
      const lastNameIndex = headers?.findIndex(h => h?.toLowerCase().includes('lastname') || h?.toLowerCase().includes('last'))
      
      if (firstNameIndex !== -1 && lastNameIndex !== -1) {
        console.log(`📋 Found firstName column at index ${firstNameIndex}, lastName at ${lastNameIndex}`)
        
        // Extract names from firstName and lastName columns
        jsonData.slice(1).forEach((row: any, rowIndex: number) => {
          if (Array.isArray(row) && row[firstNameIndex] && row[lastNameIndex]) {
            const firstName = String(row[firstNameIndex]).trim()
            const lastName = String(row[lastNameIndex]).trim()
            const fullName = `${firstName} ${lastName}`.trim()
            
            // COMPREHENSIVE F-DESIGNATION DETECTION - ANYWHERE IN NAME
            const isFDesignation = 
              firstName.startsWith('F2') || firstName.startsWith('F4') || firstName.startsWith('F6') ||
              firstName.includes(' F2') || firstName.includes(' F4') || firstName.includes(' F6') ||
              firstName.endsWith(' F2') || firstName.endsWith(' F4') || firstName.endsWith(' F6') ||
              lastName.startsWith('F2') || lastName.startsWith('F4') || lastName.startsWith('F6') ||
              lastName.includes(' F2') || lastName.includes(' F4') || lastName.includes(' F6') ||
              lastName.endsWith(' F2') || lastName.endsWith(' F4') || lastName.endsWith(' F6') ||
              /F[246]/.test(firstName) || /F[246]/.test(lastName)
            
            if (isFDesignation) {
              console.log(`🎯 F-DESIGNATION FOUND at row ${rowIndex + 2}: ${fullName}`)
              names.add(fullName)
            }
            // FIXED: Regular names (removed number check)
            else if (firstName && lastName && 
                !excludedNames.has(fullName) && 
                !excludedTerms.has(firstName) && 
                !excludedTerms.has(lastName) &&
                fullName.length < 50) {
              names.add(fullName)
            }
          }
        })
      } else {
        // Fallback: look through all cells for name patterns
        jsonData.forEach((row: any) => {
          if (Array.isArray(row)) {
            row.forEach((cell: any) => {
              if (typeof cell === 'string') {
                const trimmed = cell.trim()
                
                // COMPREHENSIVE F-DESIGNATION DETECTION
                const isFDesignation = 
                  trimmed.startsWith('F2 ') || 
                  trimmed.startsWith('F4 ') || 
                  trimmed.startsWith('F6 ') ||
                  trimmed.includes(' F2 ') || 
                  trimmed.includes(' F4 ') || 
                  trimmed.includes(' F6 ') ||
                  trimmed.endsWith(' F2') || 
                  trimmed.endsWith(' F4') || 
                  trimmed.endsWith(' F6') ||
                  /F[246]/.test(trimmed)  // Anywhere in the name
                
                // FIXED: Better name pattern that allows F-designations anywhere
                const namePattern = /^[A-Za-z\sF246]+$/
                
                // FIXED: Allow numbers only in F-designations
                const hasNumbers = /\d/.test(trimmed)
                
                if ((namePattern.test(trimmed) || isFDesignation) && 
                    trimmed.length < 50 && 
                    (!hasNumbers || isFDesignation) &&  // Allow numbers only in F-names
                    !excludedNames.has(trimmed) &&
                    !excludedTerms.has(trimmed) &&
                    trimmed.split(' ').length >= 2) {   // At least 2 words (first + last)
                  names.add(trimmed)
                }
              }
            })
          }
        })
      }
    })
    
    const namesList = Array.from(names)
    console.log('✅ Directly extracted names:', namesList.length)
    console.log('🔍 F-designated names found:', namesList.filter((name: string) => name.includes('F2') || name.includes('F4') || name.includes('F6')))
    
    return {
      success: true,
      names: namesList,
      confidence: 0.9,
      reasoning: 'Direct extraction with comprehensive F-designation preservation'
    }
    
  } catch (error) {
    console.error('❌ Direct extraction error:', error)
    return {
      success: false,
      names: [],
      confidence: 0,
      reasoning: `Direct extraction failed: ${(error as Error).message}`
    }
  }
}

// Extract text from different file types
async function extractTextFromFile(file: Uint8Array, fileType: string): Promise<string> {
  console.log('📄 Extracting text from file type:', fileType)
  
  if (fileType.includes('excel') || fileType.includes('spreadsheet') || 
      fileType.includes('xlsx') || fileType.includes('xls')) {
    return extractTextFromExcel(file)
  }
  
  if (fileType.includes('csv') || fileType.includes('text/plain')) {
    const text = new TextDecoder().decode(file)
    console.log('📝 Extracted text length:', text.length)
    return text
  }
  
  // Fallback: try to decode as text
  const text = new TextDecoder().decode(file)
  console.log('📄 Fallback text extraction:', text.length)
  return text
}

// Extract names using AI
async function extractNamesWithAI(text: string): Promise<{
  success: boolean
  names: string[]
  confidence: number
  reasoning: string
  error?: string
}> {
  console.log('🤖 Starting AI name extraction...')
  
  try {
    await rateLimiter.waitIfNeeded()
    
    // FIXED: Increased character limit from 40k to 120k
    const textToAnalyze = text.length > 120000 ? text.substring(0, 120000) : text
    
    // Add debug logging for F-designations
    console.log('🔍 CHECKING FOR F-DESIGNATIONS IN EXTRACTED TEXT:')
    const fPatterns = ['F2 Kevin', 'F6 Kevin', 'F4 Ingabire', 'Divine F2']
    fPatterns.forEach(pattern => {
      const found = textToAnalyze.includes(pattern)
      console.log(`${found ? '✅' : '❌'} "${pattern}": ${found ? 'FOUND' : 'MISSING'}`)
      
      if (!found) {
        // Show what's actually in the text around that area
        const sampleIndex = textToAnalyze.indexOf('Kevin')
        if (sampleIndex > -1) {
          const sample = textToAnalyze.substring(sampleIndex - 50, sampleIndex + 50)
          console.log(`   Sample context: ...${sample}...`)
        }
      }
    })
    
    const prompt = `CRITICAL MISSION: EXTRACT STUDENT NAMES WITH 100% ACCURACY - PRESERVE ALL F-DESIGNATIONS

    ## 🎯 NON-NEGOTIABLE EXTRACTION RULES:
    
    ### F-DESIGNATION PRESERVATION - EXTRACT EXACTLY AS SHOWN:
    🔴 **MUST PRESERVE**: "F2 Kevin" → "F2 Kevin Ntwali"
    🔴 **MUST PRESERVE**: "F6 Kevin" → "F6 Kevin Ntwali"  
    🔴 **MUST PRESERVE**: "F4 Ingabire" → "F4 Ingabire Divine"
    🔴 **MUST PRESERVE**: "Divine F2" → "Divine F2 Ingabire"
    🔴 **MUST KEEP F-PREFIXES**: F2, F4, F6 are PART OF THE NAME
    
    ### SPECIFIC F-DESIGNATED STUDENTS TO EXTRACT:
    - ID 2708: "F2 Kevin Ntwali"
    - ID 2794: "F6 Kevin Ntwali"
    - ID 2581: "F4 Ingabire Divine" 
    - ID 2593: "Divine F2 Ingabire"
    
    ### EXTRACTION PATTERN:
    firstName + lastName = fullName
    "F2 Kevin" + "Ntwali" = "F2 Kevin Ntwali"
    "F6 Kevin" + "Ntwali" = "F6 Kevin Ntwali"
    
    ## 🚨 COMPLETE EXCLUSION LIST - REJECT THESE:
    
    ### FAMILY/HOUSE NAMES (ALL):
    KATHERINE JOHNSON, YVAN BURAVAN, Chinua Achebe, RUGANZU NDOLI 2, Pelé (Edson Arantes Do Nascimento), 
    Toni Morrison, Ubald Rugirangoga, Charles Babbage, Alfred Nobel, Ruth Bader Ginsberg, AOUA KEITA, 
    Fannie Lou Hamer, Niyitegeka Felestin, Lance Solomon Reddick, ADA loveloce, Rosalie Gicanda, 
    Irena Sendler, Thomas Edison
    
    ### GRADES/LEVELS:
    Ijabo, Ishami, Ingabo, S1, S2, S3, S4, S5, S6, Primary, Secondary
    
    ### SUBJECTS/COMBINATIONS:
    Mathematics, Computer Science, Economics, History, Geography, Literature, Physics, Chemistry, Biology,
    Mathematics Physics and Computer Science, Mathematics Computer Science and Economics, 
    History Geography and Literature in English, Mathematics Economics and Geography, 
    Physics Chemistry and Biology
    
    ### INSTITUTIONAL TERMS:
    Family 1, Family 2, Family 3, Family 4, Family 5, Family 6,
    EY_Iron, EY_Silver, EY_Gold, EY_Diamond
    
    ### CONTACT INFO:
    Email addresses, phone numbers, ID numbers
    
    ## ✅ EXTRACTION VALIDATION CHECKLIST:
    - [ ] F2 Kevin Ntwali extracted with F2 prefix
    - [ ] F6 Kevin Ntwali extracted with F6 prefix  
    - [ ] F4 Ingabire Divine extracted with F4 prefix
    - [ ] Divine F2 Ingabire extracted with F2 suffix
    - [ ] All other student names extracted
    - [ ] ZERO family names in output
    - [ ] ZERO academic terms in output
    
    ## 📊 EXPECTED RESULTS:
    - Total names: ~387 students
    - Must include F-designated names exactly as shown in source
    - Format: "FirstName LastName" preserving F2/F4/F6 designations
    
    Text to analyze:
    ${textToAnalyze}
    
    Return JSON:
    {
      "names": ["F2 Kevin Ntwali", "F6 Kevin Ntwali", "F4 Ingabire Divine", "Divine F2 Ingabire", "Rachel GIRAMATA", "AGAHIRE Ketia SHARANGABO"],
      "totalExtracted": 387,
      "fDesignationsFound": ["F2 Kevin Ntwali", "F6 Kevin Ntwali", "F4 Ingabire Divine", "Divine F2 Ingabire"],
      "confidence": 0.98,
      "validation": "All F-designated names preserved, excluded all non-student terms",
      "reasoning": "Extracted student names exactly as they appear in firstName/lastName columns, preserved critical F2/F4/F6 designations that distinguish different students"
    }`
    
    console.log('📤 Sending request to Groq...')
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You extract person names from text. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.1,
      max_tokens: 2000,
    })

    const response = completion.choices[0]?.message?.content
    console.log('📥 AI Response received')

    if (!response) {
      throw new Error('No response from AI')
    }

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    
    const parsedResponse = JSON.parse(jsonMatch[0])

    if (!Array.isArray(parsedResponse.names)) {
      throw new Error('Invalid response format')
    }

    // Clean names
    const cleanedNames = parsedResponse.names
      .filter((name: string) => name && typeof name === 'string' && name.trim().length > 2)
      .map((name: string) => name.trim())
      .filter((name: string, index: number, arr: string[]) => arr.indexOf(name) === index)

    console.log('✅ AI extracted names:', cleanedNames.length)
    console.log('🔍 AI F-designated names:', cleanedNames.filter((name: string) => name.includes('F2') || name.includes('F4') || name.includes('F6')))

    return {
      success: true,
      names: cleanedNames,
      confidence: parsedResponse.confidence || 0.8,
      reasoning: parsedResponse.reasoning || 'AI extraction'
    }

  } catch (error) {
    console.error('❌ AI extraction error:', error)
    return {
      success: false,
      names: [],
      confidence: 0,
      reasoning: `AI failed: ${(error as Error).message}`,
      error: (error as Error).message
    }
  }
}

console.log("✅ Excel Name Extractor loaded")

// @ts-ignore
Deno.serve(async (req) => {
  console.log(`📨 ${req.method} request received`)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const startTime = Date.now()
    console.log('🚀 Processing started...')
    
    const body = await req.json()
    const { filePath, fileType } = body
    
    if (!filePath) {
      return new Response(
        JSON.stringify({ error: "filePath is required" }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }
    
    console.log('📥 Downloading file:', filePath)
    
    // Download file
    const { data, error } = await supabase.storage
      .from("reports")
      .download(filePath)
      
    if (error) {
      console.log('❌ Storage error:', error)
      return new Response(
        JSON.stringify({ error: "Failed to download file" }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    }
    
    const arrayBuffer = await data.arrayBuffer()
    const fileBytes = new Uint8Array(arrayBuffer)
    console.log('✅ File downloaded:', fileBytes.length, 'bytes')
    
     let result
     let extractedData: any = {}
     
     // For Excel files, try direct extraction first
     if (fileType?.includes('excel') || fileType?.includes('spreadsheet') || 
         fileType?.includes('xlsx') || fileType?.includes('xls')) {
       
       console.log('📊 Excel file detected - using direct extraction')
       result = extractNamesFromExcel(fileBytes)
       
       // Get all Excel data for debugging
       try {
         const workbook = XLSX.read(fileBytes, { type: 'array' })
         extractedData = {
           fileType: 'Excel',
           sheets: workbook.SheetNames.map((sheetName: string) => {
             const worksheet = workbook.Sheets[sheetName]
             const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
             const csvData = XLSX.utils.sheet_to_csv(worksheet)
             
             return {
               sheetName,
               rowCount: jsonData.length,
               rawData: jsonData,
               csvData: csvData,
               allCells: jsonData.flat().filter((cell: any) => cell !== null && cell !== undefined && cell !== '')
             }
           })
         }
       } catch (excelError) {
         console.error('❌ Excel parsing error:', excelError)
         extractedData = { error: `Excel parsing failed: ${(excelError as Error).message}` }
       }
       
       // If direct extraction fails or finds no names, try AI
       if (!result.success || result.names.length === 0) {
         console.log('🔄 Direct extraction failed, trying AI...')
         const text = await extractTextFromFile(fileBytes, fileType)
         result = await extractNamesWithAI(text)
         extractedData.textExtraction = text
       }
     } else {
       // For other files, extract text and use AI
       const text = await extractTextFromFile(fileBytes, fileType || 'text/plain')
       result = await extractNamesWithAI(text)
       extractedData = {
         fileType: fileType || 'unknown',
         textExtraction: text,
         textLength: text.length
       }
     }
     
     console.log('✅ Extraction complete:', result.names.length, 'names')
     console.log('🔍 Final F-designated names:', result.names.filter((name: string) => name.includes('F2') || name.includes('F4') || name.includes('F6')))
     
     return new Response(
       JSON.stringify({
         success: result.success,
         names: result.names,
         confidence: result.confidence,
         reasoning: result.reasoning,
         totalNames: result.names.length,
         processingTime: Date.now() - startTime,
         extractedData: extractedData
       }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
    
  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error as Error).message 
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  }
})