FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY *.csproj ./

RUN dotnet nuget add source https://api.nuget.org/v3/index.json -n nuget.org || true && \
    dotnet restore --disable-parallel --no-cache || \
    (sleep 10 && dotnet restore --disable-parallel --no-cache) || \
    (sleep 20 && dotnet restore --disable-parallel --no-cache)

COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "backend.dll"]