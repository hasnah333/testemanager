# Lance le backend Test Manager (jar) avec la cle OpenRouter lue depuis l'environnement utilisateur.
# La cle n'est jamais ecrite en dur : elle provient de la variable OPENROUTER_API_KEY (setx).
$env:OPENROUTER_API_KEY = [Environment]::GetEnvironmentVariable('OPENROUTER_API_KEY', 'User')
Set-Location 'C:\Users\Hasna\OneDrive\Desktop\projectpfee\backend'
$jar = 'target\testmanagement-0.0.1-SNAPSHOT.jar'
java -jar $jar 2>&1 | Out-File -FilePath 'C:\Users\Hasna\OneDrive\Desktop\projectpfee\backend\backend-run.log' -Encoding utf8
