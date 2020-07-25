# sentiment_analysis

Provides sentiment analysis over a user's last N-messages. The plugin uses
[DatumBox's Sentiment Analysis API](http://www.datumbox.com/api-sandbox/#!/Document-Classification/SentimentAnalysis_post_0)
 and you must provide the API key in your `secret.json`:

```json
{
    ...
    "datumbox": "api-token-here"
}
```

### Example Usage

```
analyse omar

#> Output
omar has recently been positive
```

