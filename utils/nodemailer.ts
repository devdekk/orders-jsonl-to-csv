import nodemailer from 'nodemailer';

export const sendTestEmail = async (emailAdress: string, csv: string) => {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  const info = await transporter.sendMail({
    from: 'test@ethereal.com',
    to: emailAdress,
    subject: 'Orders CSV',
    text: 'New orders received',
    html: 'Please find recent orders attached!',
    attachments: [{ filename: 'out.csv', content: csv }]
  });

  // eslint-disable-next-line no-console
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};
