package com.ai.frame.util;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class WebServiceUtil {

    public static String HttpConect(String url,String soap) {
        InputStream is = null;
        OutputStream os = null;
        HttpURLConnection conn = null;
        String s = "";

//服务的地址
        try {
//            URL wsUrl = new URL("http://10.145.206.11:8899/services/crmService/Purdo2CrmWebService");
//            URL wsUrl = new URL("http://localhost:8080/addrselection/queryAddress");
            URL wsUrl = new URL(url);
            conn = (HttpURLConnection) wsUrl.openConnection();

            conn.setDoInput(true);
            conn.setDoOutput(true);
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "text/xml;charset=UTF-8");

            os = conn.getOutputStream();

            //请求体
//            String soap = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:impl=\"http://impl.service.crm.intf.telement.com/\">\n" +
//                    " <soapenv:Header/>\n" +
//                    " <soapenv:Body>\n" +
//                    "  <impl:queryRes>\n" +
//                    "   <!--Optional:-->\n" +
//                    "   <impl:requestXml><![CDATA[\n" +
//                    "<requestdata> \n" +
//                    " <ADDRESS_ID>42480926</ADDRESS_ID> \n" +
//                    "</requestdata>\n" +
//                    "  ]]></impl:requestXml>\n" +
//                    "  </impl:queryRes>\n" +
//                    " </soapenv:Body>\n" +
//                    "</soapenv:Envelope>\n";


//            String soap = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:impl=\"http://impl.service.crm.intf.telement.com/\">\n" +
//                    " <soapenv:Header/>\n" +
//                    " <soapenv:Body>\n" +
//                    "  <impl:queryRes>\n" +
//                    "   <!--Optional:-->\n" +
//                    "   <impl:requestXml><![CDATA[\n" +
//                    "<requestdata> \n" +
//                    " <ADDRESS_ID>39480808</ADDRESS_ID> \n" +
//                    "</requestdata>\n" +
//                    "  ]]></impl:requestXml>\n" +
//                    "  </impl:queryRes>\n" +
//                    " </soapenv:Body>\n" +
//                    "</soapenv:Envelope>";

            os.write(soap.getBytes());

            is = conn.getInputStream();

            byte[] b = new byte[1024];
            int len = 0;

            while ((len = is.read(b)) != -1) {
                String ss = new String(b, 0, len, "UTF-8");
                s += ss;
            }
            System.out.println(s);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (is != null) {
                try {
                    is.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return s;
    }
}
