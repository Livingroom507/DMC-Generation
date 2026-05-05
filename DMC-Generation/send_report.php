<?php
/**
 * Livingroom507MOC - Global Growth Report Generator
 * Generates a PDF report and sends it via PHPMailer.
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Note: Ensure PHPMailer and FPDF are installed. 
// If using Composer: require 'vendor/autoload.php';
// Otherwise, require the library files manually.

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize inputs
    $userEmail    = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $principal    = $_POST['principal'] ?? 0;
    $contribution = $_POST['contribution'] ?? 0;
    $rate         = $_POST['rate'] ?? 0;
    $years        = $_POST['years'] ?? 0;
    $futureValue  = $_POST['future_value'] ?? '$0.00';
    $region       = $_POST['region'] ?? 'Global Landscape';

    if (!filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
        die("Error: Invalid email address.");
    }

    // 1. Generate PDF using FPDF
    // Assuming fpdf.php is accessible in your include path
    require_once('fpdf.php'); 
    
    $pdf = new FPDF();
    $pdf->AddPage();

    // Add Logo (Assuming logo.png exists in your root)
    if (file_exists('logo.png')) {
        $pdf->Image('logo.png', 10, 10, 30);
    }

    $pdf->SetTextColor(181, 148, 16); // Gold #b59410
    $pdf->SetFont('Arial', 'B', 18);
    $pdf->Cell(0, 15, 'LIVINGROOM507MOC', 0, 1, 'C');
    $pdf->SetTextColor(17, 17, 17); // Black #111111
    $pdf->SetFont('Arial', 'I', 12);
    $pdf->Cell(0, 10, 'Global Project Landscape Growth Report', 0, 1, 'C');
    $pdf->Ln(10);

    $pdf->SetFont('Arial', '', 12);
    $pdf->Cell(0, 10, "Target Region: $region", 0, 1);
    $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());
    $pdf->Ln(5);

    $pdf->Cell(60, 10, "Initial Principal:", 0, 0);
    $pdf->Cell(0, 10, "$" . number_format($principal, 2), 0, 1);
    $pdf->Cell(60, 10, "Monthly Contribution:", 0, 0);
    $pdf->Cell(0, 10, "$" . number_format($contribution, 2), 0, 1);
    $pdf->Cell(60, 10, "Annual Interest Rate:", 0, 0);
    $pdf->Cell(0, 10, "$rate%", 0, 1);
    $pdf->Cell(60, 10, "Duration:", 0, 0);
    $pdf->Cell(0, 10, "$years Year(s)", 0, 1);
    
    $pdf->Ln(10);
    $pdf->SetFont('Arial', 'B', 14);
    $pdf->SetTextColor(181, 148, 16); // Using your --gold color #b59410
    $pdf->Cell(60, 10, "Projected Future Value:", 0, 0);
    $pdf->Cell(0, 10, $futureValue, 0, 1);

    $pdfContent = $pdf->Output('S'); // Return as string

    // 2. Send Email with PHPMailer
    $mail = new PHPMailer(true);

    try {
        // SMTP Settings
        $mail->isSMTP();
        $mail->Host       = getenv('SMTP_HOST') ?: 'smtp.your-hosting.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = getenv('SMTP_USER') ?: 'management@livingroom507.com';
        $mail->Password   = getenv('SMTP_PASS') ?: 'your_password';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        $mail->setFrom('management@livingroom507.com', 'Livingroom507MOC Management');
        $mail->addAddress($userEmail);

        // Attachment
        $mail->addStringAttachment($pdfContent, 'Livingroom507_Growth_Report.pdf');

        // Content
        $mail->isHTML(true);
        $mail->Subject = "Your Growth Projection Report - $region";
        $mail->Body    = "Hello,<br><br>Attached is your personalized <b>Livingroom507MOC</b> compound interest report.<br><br>This projection accounts for your selected managerial framework and current market trends in the $region area.<br><br>Regards,<br>Management Team";

        $mail->send();
        echo "Report successfully dispatched to $userEmail";
    } catch (Exception $e) {
        echo "Mailer Error: {$mail->ErrorInfo}";
    }
}