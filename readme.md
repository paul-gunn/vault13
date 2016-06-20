First, configure the OPTIONSVerbHandler to execute before .Net handlers.

In IIS console, select "Handler Mappings" (either on server level or site level; beware that on site level it will redefine all the handlers for your site and ignore any change done on server level after that; and of course on server level, this could break other sites if they need their own handling of options verb).
In Action pane, select "View ordered list..." Seek OPTIONSVerbHandler, and move it up (lots of clicks...).
You can also do this in web.config by redefining all handlers under <system.webServer><handlers> (<clear> then <add ...> them back, this is what does the IIS console for you) (By the way, there is no need to ask for "read" permission on this handler.)
Second, configure custom http headers for your cors needs, such as:

<system.webServer>
  <httpProtocol>
    <customHeaders>
      <add name="Access-Control-Allow-Origin" value="*"/>
      <add name="Access-Control-Allow-Headers" value="Content-Type,SOAPAction"/>
      <add name="Access-Control-Allow-Methods" value="POST,GET,OPTIONS"/>
    </customHeaders>
  </httpProtocol>
</system.webServer>