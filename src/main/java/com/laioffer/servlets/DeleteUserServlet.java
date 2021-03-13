package com.laioffer.servlets;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.laioffer.db.MySQLConnection;
import com.laioffer.entity.LoginRequestBody;
import com.laioffer.entity.ResultResponse;
import com.laioffer.entity.deleteRequestBody;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;

@WebServlet(name = "DeleteUserServlet", urlPatterns = "/delete")
public class DeleteUserServlet extends HttpServlet {
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ObjectMapper mapper = new ObjectMapper();
        HttpSession session = request.getSession(false);
        if (session == null) {
            response.setStatus(403);
            mapper.writeValue(response.getWriter(), new ResultResponse("Session Invalid"));
            return;
        }
        //deleteRequestBody body = mapper.readValue(request.getReader(), deleteRequestBody.class);
        String userId = (String) session.getAttribute("user_id");
        response.setContentType("application/json");
        MySQLConnection connection = new MySQLConnection();
        connection.deleteUser(userId);
        connection.close();
        ResultResponse resultResponse = new ResultResponse(userId +" Account Deleted.");
        mapper.writeValue(response.getWriter(), resultResponse);
    }
}
